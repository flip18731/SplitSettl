import type { AIAnalysisResult } from "./ai";

/**
 * Pre-cached sample result matching the real API shape.
 * Used as fallback if the API call fails or takes too long.
 */
export const SAMPLE_RESULT: AIAnalysisResult = {
  repository: "vercel/next.js",
  branch: "main",
  commitsAnalyzed: 18,
  aiSummary:
    "Robert Craigie leads in complexity and feature impact with core streaming and client architecture. Stainless Bot provides automated schema synchronization with moderate breadth. Deven Mital contributes focused testing infrastructure and documentation.",
  codeSnippets: [
    {
      file: "src/_streaming.py",
      author: "Robert Craigie",
      code: `class AsyncStream:\n    async def __aiter__(self):\n        async for chunk in self._stream:\n            if chunk.type == "content_block_delta":\n                yield chunk.delta\n\n    async def close(self):\n        await self._stream.close()`,
    },
    {
      file: "src/_client.py",
      author: "Robert Craigie",
      code: `def _make_request(self, method, path, **kwargs):\n    headers = self._build_headers()\n    response = self._session.request(\n        method, f"{self.base_url}{path}",\n        headers=headers, timeout=self._timeout,\n    )\n    return self._parse_response(response)`,
    },
    {
      file: "src/types/__init__.py",
      author: "Stainless Bot",
      code: `from .message import Message, MessageParam\nfrom .completion import Completion\nfrom .content_block import ContentBlock\nfrom .tool_use_block import ToolUseBlock\n\n__all__ = [\n    "Message", "MessageParam",\n    "Completion", "ContentBlock",\n]`,
    },
    {
      file: "tests/test_streaming.py",
      author: "Deven Mital",
      code: `@pytest.mark.asyncio\nasync def test_streaming_message():\n    stream = await client.messages.create(\n        model="claude-sonnet-4-20250514",\n        max_tokens=100, stream=True,\n    )\n    chunks = [c async for c in stream]\n    assert len(chunks) > 0`,
    },
    {
      file: "src/_retry.py",
      author: "Robert Craigie",
      code: `async def _retry_request(self, max_retries=3):\n    for attempt in range(max_retries):\n        try:\n            return await self._send()\n        except APIConnectionError:\n            if attempt == max_retries - 1:\n                raise\n            await asyncio.sleep(2 ** attempt)`,
    },
  ],
  splits: [
    {
      name: "Robert Craigie",
      percentage: 45,
      impactRating: "HIGH",
      impactScores: {
        complexity: 88,
        featureImpact: 92,
        scopeBreadth: 78,
        consistency: 85,
        volume: 100,
      },
      justification:
        "Primary architect driving core SDK design. 11 commits with +3,247/-891 lines across critical client, streaming, and type system files. Implemented the main API client, streaming handlers, and pagination system.",
      keyContributions: [
        "Core API client implementation (src/_client.py)",
        "Streaming response architecture (src/_streaming.py)",
        "Type system and model definitions (src/types/)",
      ],
      keyEvidence: [
        {
          sha: "a1b2c3d",
          message: "feat: implement streaming response handler",
          impact: "HIGH",
          additions: 847,
        },
        {
          sha: "u6v7w8x",
          message: "feat: retry logic with backoff",
          impact: "HIGH",
          additions: 301,
        },
      ],
    },
    {
      name: "Stainless Bot",
      percentage: 30,
      impactRating: "MEDIUM",
      impactScores: {
        complexity: 30,
        featureImpact: 38,
        scopeBreadth: 55,
        consistency: 45,
        volume: 65,
      },
      justification:
        "Automated code generation contributing 4 commits with +1,892/-445 lines. Maintained type stubs, API surface updates, and schema synchronization essential for SDK correctness.",
      keyContributions: [
        "Auto-generated type definitions and API methods",
        "Schema synchronization with upstream API",
        "Release automation and version bumping",
      ],
      keyEvidence: [
        {
          sha: "s4t5u6v",
          message: "chore: regenerate types from schema",
          impact: "MEDIUM",
          additions: 723,
        },
        {
          sha: "w7x8y9z",
          message: "chore: update API surface",
          impact: "MEDIUM",
          additions: 534,
        },
      ],
    },
    {
      name: "Deven Mital",
      percentage: 25,
      impactRating: "MEDIUM",
      impactScores: {
        complexity: 52,
        featureImpact: 55,
        scopeBreadth: 32,
        consistency: 40,
        volume: 35,
      },
      justification:
        "3 commits with +987/-234 lines focused on testing infrastructure and documentation. Built comprehensive test suite covering edge cases and wrote migration guides.",
      keyContributions: [
        "Test suite for streaming and pagination (tests/)",
        "Migration guide and README updates",
        "CI configuration and test fixtures",
      ],
      keyEvidence: [
        {
          sha: "i6j7k8l",
          message: "test: add streaming test suite",
          impact: "MEDIUM",
          additions: 534,
        },
        {
          sha: "m9n0o1p",
          message: "docs: write migration guide",
          impact: "LOW",
          additions: 312,
        },
      ],
    },
  ],
  invoice: {
    id: "INV-2026-4821",
    project: "vercel/next.js",
    generatedAt: new Date().toISOString(),
    items: [
      {
        contributor: "Robert Craigie",
        description:
          "Core API client, streaming handlers, and type system architecture",
        commits: 11,
        linesAdded: 3247,
        linesDeleted: 891,
        topFiles: ["src/_client.py", "src/_streaming.py", "src/types/message.py"],
        impactRating: "HIGH",
        amount: 540,
      },
      {
        contributor: "Stainless Bot",
        description:
          "Automated type generation, schema sync, and release pipeline",
        commits: 4,
        linesAdded: 1892,
        linesDeleted: 445,
        topFiles: ["src/types/__init__.py", "src/_models.py", "pyproject.toml"],
        impactRating: "MEDIUM",
        amount: 360,
      },
      {
        contributor: "Deven Mital",
        description: "Test infrastructure, documentation, and CI configuration",
        commits: 3,
        linesAdded: 987,
        linesDeleted: 234,
        topFiles: ["tests/test_streaming.py", "README.md", "MIGRATION.md"],
        impactRating: "MEDIUM",
        amount: 300,
      },
    ],
    total: 1200,
    currency: "USDT",
  },
  hasAddressConfig: false,
  visualizationData: {
    contributors: [
      {
        name: "Robert Craigie",
        commits: 11,
        additions: 3247,
        deletions: 891,
        filesChanged: 24,
        languages: ["py", "toml", "md"],
        commitTimeline: [
          { date: "2026-04-01T10:00:00Z", sha: "a1b2c3d", message: "feat: implement streaming response handler", additions: 847, deletions: 123, author: "Robert Craigie" },
          { date: "2026-04-03T14:22:00Z", sha: "e4f5g6h", message: "feat: add pagination support", additions: 523, deletions: 89, author: "Robert Craigie" },
          { date: "2026-04-05T09:15:00Z", sha: "i7j8k9l", message: "refactor: client architecture", additions: 412, deletions: 267, author: "Robert Craigie" },
          { date: "2026-04-06T16:30:00Z", sha: "m0n1o2p", message: "feat: type-safe message creation", additions: 389, deletions: 45, author: "Robert Craigie" },
          { date: "2026-04-07T11:00:00Z", sha: "q3r4s5t", message: "fix: streaming edge cases", additions: 234, deletions: 78, author: "Robert Craigie" },
          { date: "2026-04-08T13:45:00Z", sha: "u6v7w8x", message: "feat: retry logic with backoff", additions: 301, deletions: 56, author: "Robert Craigie" },
          { date: "2026-04-09T10:20:00Z", sha: "y9z0a1b", message: "feat: tool use support", additions: 198, deletions: 34, author: "Robert Craigie" },
          { date: "2026-04-10T15:00:00Z", sha: "c2d3e4f", message: "fix: type narrowing for unions", additions: 145, deletions: 89, author: "Robert Craigie" },
          { date: "2026-04-11T09:30:00Z", sha: "g5h6i7j", message: "chore: update dependencies", additions: 67, deletions: 43, author: "Robert Craigie" },
          { date: "2026-04-12T14:15:00Z", sha: "k8l9m0n", message: "feat: batch message API", additions: 98, deletions: 52, author: "Robert Craigie" },
          { date: "2026-04-13T08:00:00Z", sha: "o1p2q3r", message: "docs: update API reference", additions: 33, deletions: 15, author: "Robert Craigie" },
        ],
        dailyActivity: {
          "2026-04-01": 1, "2026-04-03": 1, "2026-04-05": 1, "2026-04-06": 1,
          "2026-04-07": 1, "2026-04-08": 1, "2026-04-09": 1, "2026-04-10": 1,
          "2026-04-11": 1, "2026-04-12": 1, "2026-04-13": 1,
        },
        fileTypeBreakdown: { py: 18, toml: 2, md: 3, yml: 1 },
      },
      {
        name: "Stainless Bot",
        commits: 4,
        additions: 1892,
        deletions: 445,
        filesChanged: 15,
        languages: ["py", "toml"],
        commitTimeline: [
          { date: "2026-04-02T02:00:00Z", sha: "s4t5u6v", message: "chore: regenerate types from schema", additions: 723, deletions: 156, author: "Stainless Bot" },
          { date: "2026-04-05T02:00:00Z", sha: "w7x8y9z", message: "chore: update API surface", additions: 534, deletions: 123, author: "Stainless Bot" },
          { date: "2026-04-09T02:00:00Z", sha: "a0b1c2d", message: "chore: sync schema changes", additions: 412, deletions: 98, author: "Stainless Bot" },
          { date: "2026-04-12T02:00:00Z", sha: "e3f4g5h", message: "release: v0.28.0", additions: 223, deletions: 68, author: "Stainless Bot" },
        ],
        dailyActivity: {
          "2026-04-02": 1, "2026-04-05": 1, "2026-04-09": 1, "2026-04-12": 1,
        },
        fileTypeBreakdown: { py: 12, toml: 2, md: 1 },
      },
      {
        name: "Deven Mital",
        commits: 3,
        additions: 987,
        deletions: 234,
        filesChanged: 9,
        languages: ["py", "md", "yml"],
        commitTimeline: [
          { date: "2026-04-04T17:30:00Z", sha: "i6j7k8l", message: "test: add streaming test suite", additions: 534, deletions: 23, author: "Deven Mital" },
          { date: "2026-04-08T10:00:00Z", sha: "m9n0o1p", message: "docs: write migration guide", additions: 312, deletions: 156, author: "Deven Mital" },
          { date: "2026-04-11T16:45:00Z", sha: "q2r3s4t", message: "ci: configure test matrix", additions: 141, deletions: 55, author: "Deven Mital" },
        ],
        dailyActivity: {
          "2026-04-04": 1, "2026-04-08": 1, "2026-04-11": 1,
        },
        fileTypeBreakdown: { py: 5, md: 2, yml: 2 },
      },
    ],
    allCommits: [
      { date: "2026-04-01T10:00:00Z", sha: "a1b2c3d", message: "feat: implement streaming response handler", additions: 847, deletions: 123, author: "Robert Craigie" },
      { date: "2026-04-02T02:00:00Z", sha: "s4t5u6v", message: "chore: regenerate types from schema", additions: 723, deletions: 156, author: "Stainless Bot" },
      { date: "2026-04-03T14:22:00Z", sha: "e4f5g6h", message: "feat: add pagination support", additions: 523, deletions: 89, author: "Robert Craigie" },
      { date: "2026-04-04T17:30:00Z", sha: "i6j7k8l", message: "test: add streaming test suite", additions: 534, deletions: 23, author: "Deven Mital" },
      { date: "2026-04-05T09:15:00Z", sha: "i7j8k9l", message: "refactor: client architecture", additions: 412, deletions: 267, author: "Robert Craigie" },
      { date: "2026-04-05T02:00:00Z", sha: "w7x8y9z", message: "chore: update API surface", additions: 534, deletions: 123, author: "Stainless Bot" },
      { date: "2026-04-06T16:30:00Z", sha: "m0n1o2p", message: "feat: type-safe message creation", additions: 389, deletions: 45, author: "Robert Craigie" },
      { date: "2026-04-07T11:00:00Z", sha: "q3r4s5t", message: "fix: streaming edge cases", additions: 234, deletions: 78, author: "Robert Craigie" },
      { date: "2026-04-08T13:45:00Z", sha: "u6v7w8x", message: "feat: retry logic with backoff", additions: 301, deletions: 56, author: "Robert Craigie" },
      { date: "2026-04-08T10:00:00Z", sha: "m9n0o1p", message: "docs: write migration guide", additions: 312, deletions: 156, author: "Deven Mital" },
      { date: "2026-04-09T10:20:00Z", sha: "y9z0a1b", message: "feat: tool use support", additions: 198, deletions: 34, author: "Robert Craigie" },
      { date: "2026-04-09T02:00:00Z", sha: "a0b1c2d", message: "chore: sync schema changes", additions: 412, deletions: 98, author: "Stainless Bot" },
      { date: "2026-04-10T15:00:00Z", sha: "c2d3e4f", message: "fix: type narrowing for unions", additions: 145, deletions: 89, author: "Robert Craigie" },
      { date: "2026-04-11T09:30:00Z", sha: "g5h6i7j", message: "chore: update dependencies", additions: 67, deletions: 43, author: "Robert Craigie" },
      { date: "2026-04-11T16:45:00Z", sha: "q2r3s4t", message: "ci: configure test matrix", additions: 141, deletions: 55, author: "Deven Mital" },
      { date: "2026-04-12T14:15:00Z", sha: "k8l9m0n", message: "feat: batch message API", additions: 98, deletions: 52, author: "Robert Craigie" },
      { date: "2026-04-12T02:00:00Z", sha: "e3f4g5h", message: "release: v0.28.0", additions: 223, deletions: 68, author: "Stainless Bot" },
      { date: "2026-04-13T08:00:00Z", sha: "o1p2q3r", message: "docs: update API reference", additions: 33, deletions: 15, author: "Robert Craigie" },
    ],
  },
};
