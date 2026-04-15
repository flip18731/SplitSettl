import { NextRequest, NextResponse } from "next/server";
import { isHSPConfigured, queryPayment, queryPaymentByFlow } from "@/lib/hsp-client";

export const runtime = "nodejs";

/**
 * Server-side HSP payment lookup (HMAC — secrets stay on server).
 */
export async function GET(req: NextRequest) {
  if (!isHSPConfigured()) {
    return NextResponse.json(
      { error: "HSP_APP_KEY / HSP_APP_SECRET not configured" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(req.url);
  const cartMandateId = searchParams.get("cart_mandate_id")?.trim();
  const flowId = searchParams.get("flow_id")?.trim();

  if (!cartMandateId && !flowId) {
    return NextResponse.json(
      { error: "Provide cart_mandate_id or flow_id" },
      { status: 400 }
    );
  }

  try {
    const data = cartMandateId
      ? await queryPayment(cartMandateId)
      : await queryPaymentByFlow(flowId!);
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
