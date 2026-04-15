import { NextResponse } from "next/server";

/**
 * Direct OpenAI chat completion (tiny request) to verify the key, model, and billing usage.
 * GET /api/debug/openai-smoke — dev only; never returns the API key.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const key = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  if (!key) {
    return NextResponse.json(
      {
        ok: false,
        step: "env",
        message: "OPENAI_API_KEY is not set in frontend/.env.local (or empty after trim).",
      },
      { status: 200 }
    );
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content:
              'Respond with exactly this JSON and nothing else: {"ping":"pong"}',
          },
        ],
        max_tokens: 32,
        response_format: { type: "json_object" },
      }),
    });

    const raw = await res.text();
    if (!res.ok) {
      return NextResponse.json(
        {
          ok: false,
          step: "openai_http",
          httpStatus: res.status,
          modelRequested: model,
          bodyPreview: raw.slice(0, 1200),
        },
        { status: 200 }
      );
    }

    const data = JSON.parse(raw) as {
      id?: string;
      model?: string;
      usage?: {
        prompt_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
      };
      choices?: Array<{ message?: { content?: string } }>;
    };

    return NextResponse.json({
      ok: true,
      step: "openai_ok",
      message:
        "OpenAI accepted the request. If usage still shows $0, wait a few minutes and check Usage for the same org/project as this key.",
      openaiResponseId: data.id,
      modelReturned: data.model,
      modelRequested: model,
      usage: data.usage ?? null,
      replyPreview: (data.choices?.[0]?.message?.content ?? "").slice(0, 200),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, step: "exception", message: msg },
      { status: 200 }
    );
  }
}
