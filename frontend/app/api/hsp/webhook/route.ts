import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

const APP_SECRET = process.env.HSP_APP_SECRET?.trim() || "";

/**
 * HashKey Merchant webhook — HMAC over `timestamp + "." + rawBody` with `app_secret`.
 * Supports:
 * - All-in-One: `X-Signature: t=<unix>,v1=<hex>`
 * - MultiPay guide: `X-Webhook-Timestamp` + `X-Webhook-Signature` (same message format)
 */
export async function POST(req: NextRequest) {
  if (!APP_SECRET) {
    return NextResponse.json(
      { code: 1, msg: "HSP_APP_SECRET not configured" },
      { status: 503 }
    );
  }

  const rawBody = await req.text();
  const sigHeader =
    req.headers.get("X-Signature") ||
    req.headers.get("x-signature") ||
    "";

  let timestamp = "";
  let receivedSig = "";
  for (const part of sigHeader.split(",")) {
    const p = part.trim();
    if (p.startsWith("t=")) timestamp = p.slice(2);
    if (p.startsWith("v1=")) receivedSig = p.slice(3);
  }

  if (!timestamp || !receivedSig) {
    const tsHdr =
      req.headers.get("X-Webhook-Timestamp") ||
      req.headers.get("x-webhook-timestamp") ||
      "";
    let whSig =
      req.headers.get("X-Webhook-Signature") ||
      req.headers.get("x-webhook-signature") ||
      "";
    if (tsHdr && whSig) {
      timestamp = tsHdr.trim();
      whSig = whSig.trim();
      if (whSig.includes("v1=")) {
        for (const part of whSig.split(",")) {
          const p = part.trim();
          if (p.startsWith("v1=")) receivedSig = p.slice(3);
        }
      } else {
        receivedSig = whSig;
      }
    }
  }

  if (!timestamp || !receivedSig) {
    return NextResponse.json({ code: 1, msg: "missing signature" }, { status: 401 });
  }

  const ts = parseInt(timestamp, 10);
  if (Number.isNaN(ts) || Math.abs(Date.now() / 1000 - ts) > 300) {
    return NextResponse.json({ code: 1, msg: "timestamp expired" }, { status: 401 });
  }

  const message = `${timestamp}.${rawBody}`;
  const expected = crypto.createHmac("sha256", APP_SECRET).update(message, "utf8").digest("hex");
  if (expected !== receivedSig) {
    return NextResponse.json({ code: 1, msg: "signature mismatch" }, { status: 401 });
  }

  let event: Record<string, unknown> = {};
  try {
    event = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return NextResponse.json({ code: 1, msg: "invalid json" }, { status: 400 });
  }

  console.log("[HSP webhook]", event.status, event.cart_mandate_id, event.amount);

  return NextResponse.json({ code: 0 });
}
