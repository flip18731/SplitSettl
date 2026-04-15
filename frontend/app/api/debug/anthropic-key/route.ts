import { NextResponse } from "next/server";

/**
 * Dev helper: confirms Next.js loaded LLM API keys (never returns secrets).
 * GET /api/debug/anthropic-key — disabled in production.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const anth = (process.env.ANTHROPIC_API_KEY || "").trim();
  const oai = (process.env.OPENAI_API_KEY || "").trim();
  const pref = (process.env.AI_ANALYSIS_PROVIDER || "auto").trim();
  return NextResponse.json({
    anthropic: {
      loaded: anth.length > 0,
      length: anth.length,
      startsWithSkAnt: anth.startsWith("sk-ant-"),
    },
    openai: {
      loaded: oai.length > 0,
      length: oai.length,
      startsWithSk: oai.startsWith("sk-"),
    },
    AI_ANALYSIS_PROVIDER: pref || "auto",
    OPENAI_MODEL: (process.env.OPENAI_MODEL || "gpt-4o-mini").trim(),
  });
}
