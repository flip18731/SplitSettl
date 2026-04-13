import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

interface CommitData {
  sha: string;
  message: string;
  author: string;
  date: string;
  additions: number;
  deletions: number;
  files: { name: string; additions: number; deletions: number }[];
  patch?: string;
}

interface ContributorSummary {
  name: string;
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

    return {
      name,
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

export async function POST(req: NextRequest) {
  try {
    const { repoUrl, totalBudget = 1200, branch = "main" } = await req.json();

    const match = repoUrl?.match(/github\.com\/([^/]+)\/([^/\s?#]+)/);
    if (!match) {
      return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 });
    }
    const [, owner, rawRepo] = match;
    const repo = rawRepo.replace(".git", "");

    const commits = await fetchRepoCommits(owner, repo, branch);
    if (commits.length === 0) {
      return NextResponse.json({ error: "No commits found" }, { status: 404 });
    }

    const contributors = groupByAuthor(commits);

    // Build context for Claude
    const context = contributors
      .map((c) => {
        const top5 = c.commits
          .sort((a, b) => b.additions + b.deletions - (a.additions + a.deletions))
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
            max_tokens: 1500,
            system: `You are the AI payment agent for SplitSettl on HashKey Chain. You analyze REAL GitHub commits with actual code diffs to determine fair payment splits.

Weight factors: code complexity (smart contracts > config > docs), meaningful additions (not whitespace), feature impact (new features > refactors > fixes), file importance (core contracts > tests > docs).

Respond ONLY with valid JSON. No markdown fences, no preamble. Budget: $${totalBudget}.`,
            messages: [
              {
                role: "user",
                content: `Analyze real contributions for ${owner}/${repo} and generate a payment split:

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
      "justification": "evidence-based explanation referencing specific commits and code",
      "keyContributions": ["description referencing actual files and features"]
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
        "amount": 480
      }
    ],
    "total": ${totalBudget},
    "currency": "USDT"
  }
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
    const share = totalLines > 0
      ? Math.round(((c.totalAdditions + c.totalDeletions) / totalLines) * 100)
      : Math.round(100 / contributors.length);
    return {
      name: c.name,
      percentage: share,
      justification: `${c.commits.length} commits with +${c.totalAdditions}/-${c.totalDeletions} lines across ${c.filesChanged.length} files. Languages: ${c.languages.join(", ") || "various"}.`,
      keyContributions: c.commits
        .slice(0, 3)
        .map((cm) => cm.message),
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
          amount: Math.round((totalBudget * pct) / 100),
        };
      }),
      total: totalBudget,
      currency: "USDT",
    },
  };
}
