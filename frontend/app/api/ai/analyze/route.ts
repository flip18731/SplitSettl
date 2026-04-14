import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

interface CommitData {
  sha: string;
  message: string;
  author: string;
  login: string; // GitHub username (login), used to match .splitsettle.json
  date: string;
  additions: number;
  deletions: number;
  files: { name: string; additions: number; deletions: number }[];
  patch?: string;
}

interface SplitSettleConfig {
  contributors: Record<string, string>; // { "github-login": "0xWalletAddress" }
}

interface ContributorSummary {
  name: string;
  login: string; // primary GitHub login for this contributor
  commits: CommitData[];
  totalAdditions: number;
  totalDeletions: number;
  filesChanged: string[];
  languages: string[];
  commitDates: string[];
  dailyActivity: Record<string, number>;
}

async function fetchGitHub(url: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "SplitSettl-Agent",
  };
  if (GITHUB_TOKEN) headers["Authorization"] = `token ${GITHUB_TOKEN}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${res.statusText}`);
  return res.json();
}

async function fetchRepoCommits(
  owner: string,
  repo: string,
  branch = "main",
  max = 50
): Promise<CommitData[]> {
  const commitList = await fetchGitHub(
    `https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch}&per_page=${max}`
  );

  const detailed: CommitData[] = [];
  for (const commit of commitList.slice(0, 20)) {
    try {
      const detail = await fetchGitHub(
        `https://api.github.com/repos/${owner}/${repo}/commits/${commit.sha}`
      );
      detailed.push({
        sha: commit.sha.substring(0, 7),
        message: commit.commit.message.split("\n")[0],
        author: commit.commit.author.name,
        login: (commit.author?.login as string) || commit.commit.author.name,
        date: commit.commit.author.date,
        additions: detail.stats?.additions || 0,
        deletions: detail.stats?.deletions || 0,
        files: (detail.files || []).map((f: Record<string, unknown>) => ({
          name: f.filename as string,
          additions: f.additions as number,
          deletions: f.deletions as number,
        })),
        patch: (detail.files || [])
          .slice(0, 3)
          .map((f: Record<string, unknown>) =>
            ((f.patch as string) || "").substring(0, 400)
          )
          .join("\n---\n"),
      });
    } catch {
      continue;
    }
  }
  return detailed;
}

function groupByAuthor(commits: CommitData[]): ContributorSummary[] {
  const grouped: Record<string, CommitData[]> = {};
  for (const c of commits) {
    if (!grouped[c.author]) grouped[c.author] = [];
    grouped[c.author].push(c);
  }

  const knownExts = [
    "sol", "ts", "js", "py", "rs", "go", "tsx", "jsx", "css", "html", "md",
    "yml", "yaml", "json", "toml",
  ];

  return Object.entries(grouped).map(([name, authorCommits]) => {
    const allFiles = authorCommits.flatMap((c) => c.files.map((f) => f.name));
    const extensions = allFiles
      .map((f) => f.split(".").pop() || "")
      .filter((ext) => knownExts.includes(ext));

    const dailyActivity: Record<string, number> = {};
    for (const c of authorCommits) {
      const day = c.date.substring(0, 10);
      dailyActivity[day] = (dailyActivity[day] || 0) + 1;
    }

    // Use the most common login for this author name
    const loginCounts: Record<string, number> = {};
    for (const c of authorCommits) {
      loginCounts[c.login] = (loginCounts[c.login] || 0) + 1;
    }
    const primaryLogin = Object.entries(loginCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || name;

    return {
      name,
      login: primaryLogin,
      commits: authorCommits,
      totalAdditions: authorCommits.reduce((s, c) => s + c.additions, 0),
      totalDeletions: authorCommits.reduce((s, c) => s + c.deletions, 0),
      filesChanged: Array.from(new Set(allFiles)),
      languages: Array.from(new Set(extensions)),
      commitDates: authorCommits.map((c) => c.date),
      dailyActivity,
    };
  });
}

function computeFallbackScores(c: ContributorSummary, all: ContributorSummary[]) {
  const highComplexLangs = ["sol", "rs", "go"];
  const medComplexLangs = ["ts", "tsx", "py", "js", "jsx", "css"];

  const hasHigh = c.languages.some((l) => highComplexLangs.includes(l));
  const hasMed = c.languages.some((l) => medComplexLangs.includes(l));
  const complexity = hasHigh ? 80 : hasMed ? 55 : 25;

  const featCount = c.commits.filter((cm) => /^feat/i.test(cm.message)).length;
  const fixCount = c.commits.filter((cm) => /^fix/i.test(cm.message)).length;
  const featureImpact = Math.min(100, featCount * 18 + fixCount * 10 + 15);

  const maxFiles = Math.max(...all.map((a) => a.filesChanged.length), 1);
  const scopeBreadth = Math.min(
    100,
    Math.round((c.filesChanged.length / maxFiles) * 100)
  );

  const uniqueDays = Array.from(
    new Set(c.commitDates.map((d) => d.substring(0, 10)))
  ).length;
  const consistency = Math.min(100, uniqueDays * 18);

  const maxLines = Math.max(
    ...all.map((a) => a.totalAdditions + a.totalDeletions),
    1
  );
  const totalLines = c.totalAdditions + c.totalDeletions;
  const volume = Math.round((totalLines / maxLines) * 100);

  return { complexity, featureImpact, scopeBreadth, consistency, volume };
}

function computeImpactRating(scores: {
  complexity: number;
  featureImpact: number;
  scopeBreadth: number;
  consistency: number;
  volume: number;
}): "HIGH" | "MEDIUM" | "LOW" {
  const weighted =
    scores.complexity * 0.3 +
    scores.featureImpact * 0.3 +
    scores.scopeBreadth * 0.15 +
    scores.consistency * 0.15 +
    scores.volume * 0.1;
  if (weighted >= 60) return "HIGH";
  if (weighted >= 35) return "MEDIUM";
  return "LOW";
}

export async function POST(req: NextRequest) {
  try {
    const { repoUrl, totalBudget = 1200, branch = "main" } = await req.json();

    const match = repoUrl?.match(/github\.com\/([^/]+)\/([^/\s?#]+)/);
    if (!match) {
      return NextResponse.json(
        { error: "Invalid GitHub URL" },
        { status: 400 }
      );
    }
    const [, owner, rawRepo] = match;
    const repo = rawRepo.replace(".git", "");

    // Try to fetch .splitsettle.json for auto wallet address mapping
    let splitSettleConfig: SplitSettleConfig | null = null;
    try {
      const configRes = await fetchGitHub(
        `https://api.github.com/repos/${owner}/${repo}/contents/.splitsettle.json`
      );
      if (configRes.content) {
        const decoded = Buffer.from(configRes.content, "base64").toString("utf-8");
        splitSettleConfig = JSON.parse(decoded) as SplitSettleConfig;
      }
    } catch {
      // No .splitsettle.json — wallet addresses won't be pre-filled
    }

    const commits = await fetchRepoCommits(owner, repo, branch);
    if (commits.length === 0) {
      return NextResponse.json(
        { error: "No commits found" },
        { status: 404 }
      );
    }

    const contributors = groupByAuthor(commits);

    // Extract code snippets for the front-end code scan animation
    const codeSnippets = commits
      .filter((c) => c.patch && c.patch.length > 20)
      .slice(0, 8)
      .map((c) => ({
        file: c.files[0]?.name || "unknown",
        author: c.author,
        code: (c.patch || "").substring(0, 300),
      }));

    // Build context for Claude
    const context = contributors
      .map((c) => {
        const top5 = c.commits
          .sort(
            (a, b) =>
              b.additions + b.deletions - (a.additions + a.deletions)
          )
          .slice(0, 5);

        return `
## ${c.name}
- ${c.commits.length} commits | +${c.totalAdditions} / -${c.totalDeletions} lines
- ${c.filesChanged.length} unique files | Languages: ${c.languages.join(", ") || "unknown"}
- Key commits:
${top5
  .map(
    (tc) =>
      `  [${tc.sha}] "${tc.message}" (+${tc.additions}/-${tc.deletions})
    Files: ${tc.files
        .slice(0, 4)
        .map((f) => f.name)
        .join(", ")}
    ${tc.patch ? `Code:\n\`\`\`\n${tc.patch.substring(0, 300)}\n\`\`\`` : ""}`
  )
  .join("\n")}`;
      })
      .join("\n");

    let result;

    if (ANTHROPIC_API_KEY) {
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 2500,
            system: `You are the AI payment agent for SplitSettl on HashKey Chain. You analyze REAL GitHub commits with actual code diffs to determine fair payment splits based on IMPACT, not just quantity.

CRITICAL SCORING PHILOSOPHY:
- A contributor with 5 high-complexity commits (new smart contract, security fix, core algorithm) should receive MORE than someone with 20 low-complexity commits (documentation edits, config changes, formatting fixes)
- Quality of code matters more than quantity of commits
- New feature implementation is weighted highest
- Security-related changes are weighted very high
- Smart contract code (.sol files) is weighted higher than frontend or config
- Test code is valuable but weighted less than the code it tests
- Documentation is valuable but weighted least

For each contributor, evaluate 5 dimensions on a 0-100 scale:
- complexity: How technically complex is their code? (algorithms, smart contracts = high; config, docs = low)
- featureImpact: Did they build new capabilities or make minor tweaks? (new features, critical fixes = high; typos, formatting = low)
- scopeBreadth: How many different areas of the codebase did they affect? (many modules = high; single file = low)
- consistency: Was their work spread over time or one big dump? (steady cadence = high; single burst = low)
- volume: Raw output quantity (highest commit count and lines = high, BUT this dimension matters LEAST)

Assign an overall impactRating: "HIGH", "MEDIUM", or "LOW".

For each contributor, cite 1-2 specific commits (by SHA) as key evidence for your assessment.

The percentage splits MUST sum to exactly 100. The total budget is $${totalBudget}.

Respond ONLY with valid JSON. No markdown, no backticks, no preamble.`,
            messages: [
              {
                role: "user",
                content: `Analyze real contributions for ${owner}/${repo} (branch: ${branch}) and generate a payment split:

${context}

Return this exact JSON structure:
{
  "repository": "${owner}/${repo}",
  "branch": "${branch}",
  "commitsAnalyzed": ${commits.length},
  "splits": [
    {
      "name": "author name",
      "percentage": 40,
      "impactRating": "HIGH",
      "impactScores": {
        "complexity": 85,
        "featureImpact": 92,
        "scopeBreadth": 60,
        "consistency": 75,
        "volume": 45
      },
      "justification": "evidence-based explanation referencing specific commits and code",
      "keyContributions": ["description referencing actual files and features"],
      "keyEvidence": [
        { "sha": "abc1234", "message": "feat: implement feature", "impact": "HIGH", "additions": 204 }
      ]
    }
  ],
  "invoice": {
    "id": "INV-2026-${Math.floor(Math.random() * 9000 + 1000)}",
    "project": "${owner}/${repo}",
    "generatedAt": "${new Date().toISOString()}",
    "items": [
      {
        "contributor": "name",
        "description": "what they built (reference real files)",
        "commits": 23,
        "linesAdded": 1847,
        "linesDeleted": 423,
        "topFiles": ["file1.sol", "file2.ts"],
        "impactRating": "HIGH",
        "amount": 480
      }
    ],
    "total": ${totalBudget},
    "currency": "USDT"
  },
  "aiSummary": "2-3 sentence summary of the analysis highlighting who leads in what dimensions"
}`,
              },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.content?.[0]?.text || "";
          const cleaned = text
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();
          result = JSON.parse(cleaned);
        }
      } catch (e) {
        console.error("Claude API error:", e);
      }
    }

    // If Claude failed or no key, build result from GitHub data directly
    if (!result) {
      result = buildFallbackFromGitHub(
        owner,
        repo,
        branch,
        commits,
        contributors,
        totalBudget
      );
    }

    // Attach visualization data
    result.visualizationData = {
      contributors: contributors.map((c) => ({
        name: c.name,
        commits: c.commits.length,
        additions: c.totalAdditions,
        deletions: c.totalDeletions,
        filesChanged: c.filesChanged.length,
        languages: c.languages,
        commitTimeline: c.commits.map((cm) => ({
          date: cm.date,
          sha: cm.sha,
          message: cm.message,
          additions: cm.additions,
          deletions: cm.deletions,
          author: cm.author,
        })),
        dailyActivity: c.dailyActivity,
        fileTypeBreakdown: c.filesChanged.reduce(
          (acc: Record<string, number>, f) => {
            const ext = f.split(".").pop() || "other";
            acc[ext] = (acc[ext] || 0) + 1;
            return acc;
          },
          {}
        ),
      })),
      allCommits: commits.map((c) => ({
        date: c.date,
        author: c.author,
        additions: c.additions,
        deletions: c.deletions,
        sha: c.sha,
        message: c.message,
      })),
    };

    // Attach code snippets
    result.codeSnippets = codeSnippets;

    // Ensure aiSummary exists
    if (!result.aiSummary) {
      result.aiSummary = contributors
        .map(
          (c) =>
            `${c.name}: ${c.commits.length} commits across ${c.filesChanged.length} files`
        )
        .join(". ") + ".";
    }

    // Ensure all splits have required fields
    if (result.splits) {
      for (const split of result.splits) {
        if (!split.impactScores) {
          const contributor = contributors.find((c) => c.name === split.name);
          if (contributor) {
            split.impactScores = computeFallbackScores(contributor, contributors);
          } else {
            split.impactScores = { complexity: 50, featureImpact: 50, scopeBreadth: 50, consistency: 50, volume: 50 };
          }
        }
        if (!split.impactRating) {
          split.impactRating = computeImpactRating(split.impactScores);
        }
        if (!split.keyEvidence) {
          const contributor = contributors.find((c) => c.name === split.name);
          split.keyEvidence = (contributor?.commits || []).slice(0, 2).map((cm) => ({
            sha: cm.sha,
            message: cm.message,
            impact: split.impactRating,
            additions: cm.additions,
          }));
        }

        // Attach wallet address from .splitsettle.json if available
        if (splitSettleConfig?.contributors) {
          const contributor = contributors.find((c) => c.name === split.name);
          const login = contributor?.login || split.name;
          // Try login first, then display name
          const addr =
            splitSettleConfig.contributors[login] ||
            splitSettleConfig.contributors[split.name];
          if (addr) split.walletAddress = addr;
        }
      }
    }

    // Flag whether auto address configuration was found
    result.hasAddressConfig =
      splitSettleConfig !== null &&
      Object.keys(splitSettleConfig.contributors || {}).length > 0;

    // Ensure all invoice items have impactRating
    if (result.invoice?.items) {
      for (const item of result.invoice.items) {
        if (!item.impactRating) {
          const split = result.splits?.find(
            (s: { name: string }) => s.name === item.contributor
          );
          item.impactRating = split?.impactRating || "MEDIUM";
        }
      }
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed";
    console.error("Analysis error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function buildFallbackFromGitHub(
  owner: string,
  repo: string,
  branch: string,
  commits: CommitData[],
  contributors: ContributorSummary[],
  totalBudget: number
) {
  const totalLines = contributors.reduce(
    (s, c) => s + c.totalAdditions + c.totalDeletions,
    0
  );

  const splits = contributors.map((c) => {
    const share =
      totalLines > 0
        ? Math.round(
            ((c.totalAdditions + c.totalDeletions) / totalLines) * 100
          )
        : Math.round(100 / contributors.length);

    const scores = computeFallbackScores(c, contributors);
    const rating = computeImpactRating(scores);

    return {
      name: c.name,
      percentage: share,
      impactRating: rating,
      impactScores: scores,
      justification: `${c.commits.length} commits with +${c.totalAdditions}/-${c.totalDeletions} lines across ${c.filesChanged.length} files. Languages: ${c.languages.join(", ") || "various"}.`,
      keyContributions: c.commits.slice(0, 3).map((cm) => cm.message),
      keyEvidence: c.commits.slice(0, 2).map((cm) => ({
        sha: cm.sha,
        message: cm.message,
        impact: rating as "HIGH" | "MEDIUM" | "LOW",
        additions: cm.additions,
      })),
    };
  });

  // Normalize percentages to 100
  const total = splits.reduce((s, sp) => s + sp.percentage, 0);
  if (total !== 100 && splits.length > 0) {
    splits[0].percentage += 100 - total;
  }

  return {
    repository: `${owner}/${repo}`,
    branch,
    commitsAnalyzed: commits.length,
    splits,
    invoice: {
      id: `INV-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
      project: `${owner}/${repo}`,
      generatedAt: new Date().toISOString(),
      items: contributors.map((c) => {
        const pct =
          splits.find((s) => s.name === c.name)?.percentage || 0;
        const rating =
          splits.find((s) => s.name === c.name)?.impactRating || "MEDIUM";
        return {
          contributor: c.name,
          description: c.commits
            .slice(0, 2)
            .map((cm) => cm.message)
            .join("; "),
          commits: c.commits.length,
          linesAdded: c.totalAdditions,
          linesDeleted: c.totalDeletions,
          topFiles: c.filesChanged.slice(0, 3),
          impactRating: rating,
          amount: Math.round((totalBudget * pct) / 100),
        };
      }),
      total: totalBudget,
      currency: "USDT",
    },
    aiSummary: contributors
      .map(
        (c) =>
          `${c.name} contributed ${c.commits.length} commits with ${(c.totalAdditions + c.totalDeletions).toLocaleString()} lines changed`
      )
      .join(". ") + ".",
  };
}
