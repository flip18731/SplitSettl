import { NextRequest, NextResponse } from "next/server";
import { getAddress, isAddress, ZeroAddress } from "ethers";
import {
  buildCartMandateContents,
  getDefaultPayToAddress,
  isHSPConfigured,
  submitCartMandate,
  type HspDisplayItem,
} from "@/lib/hsp-client";
import { createMerchantJWT } from "@/lib/hsp-jwt";
import type { AIInvoice } from "@/lib/ai";
import { displayFirstName } from "@/lib/format";

export const runtime = "nodejs";

/** Strip control chars — odd Unicode can trip gateway validation. */
function sanitizeHspLabel(s: string, maxLen: number): string {
  return s
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

/**
 * Line amounts + total must match exactly or HSP returns 10001 ("invalid request parameters").
 * Use integer cents per line; total = sum(cents) — avoids float drift and NaN.toFixed("NaN").
 */
function buildReconciledDisplay(
  invoice: AIInvoice,
  displayCurrency: string
): { displayItems: HspDisplayItem[]; amountStr: string } | { error: string } {
  const items = invoice.items;
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Invoice has no line items" };
  }

  const centsPerLine = items.map((item) => {
    const n = Number(item.amount);
    if (!Number.isFinite(n) || n < 0) {
      return 0;
    }
    return Math.round(n * 100);
  });

  const totalCents = centsPerLine.reduce((a, b) => a + b, 0);
  if (totalCents <= 0) {
    return {
      error:
        "Invalid invoice amounts (sum is zero or negative). Re-run analysis or check line amounts.",
    };
  }

  const displayItems: HspDisplayItem[] = items.map((item, i) => {
    const desc = (item.description || "Work").slice(0, 80);
    const rawLabel = `${displayFirstName(item.contributor)}: ${desc}`;
    const label = sanitizeHspLabel(rawLabel, 200) || "Line item";
    return {
      label,
      amount: {
        currency: displayCurrency,
        value: (centsPerLine[i]! / 100).toFixed(2),
      },
    };
  });

  return {
    displayItems,
    amountStr: (totalCents / 100).toFixed(2),
  };
}

type Body = {
  invoice: AIInvoice;
  payTo?: string;
  coin?: "USDC" | "USDT";
};

export async function POST(req: NextRequest) {
  if (!isHSPConfigured()) {
    return NextResponse.json(
      {
        error: "HSP not configured",
        fallback: true,
        message:
          "HSP credentials pending — use Direct Wallet Settlement. Email hsp_hackathon@hashkey.com for app_key / app_secret.",
      },
      { status: 503 }
    );
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { invoice, payTo: payToRaw, coin: coinRaw } = body;
  if (!invoice?.id || !Array.isArray(invoice.items)) {
    return NextResponse.json({ error: "invoice required" }, { status: 400 });
  }

  const rawPay = (payToRaw || "").trim() || getDefaultPayToAddress();
  const payTo =
    rawPay && isAddress(rawPay)
      ? getAddress(rawPay)
      : rawPay;

  if (!payTo || !isAddress(payTo) || payTo === getAddress(ZeroAddress)) {
    return NextResponse.json(
      {
        error:
          "Invalid pay_to: set NEXT_PUBLIC_CONTRACT_ADDRESS (deployed SplitSettl) in .env.local / Vercel.",
        fallback: true,
      },
      { status: 400 }
    );
  }

  const isTestnet = process.env.NEXT_PUBLIC_CHAIN_ID !== "177";
  const envCoin = process.env.HSP_SETTLEMENT_COIN?.trim().toUpperCase();
  let coin: "USDC" | "USDT" =
    coinRaw === "USDT" ? "USDT" : "USDC";
  if (envCoin === "USDT" || envCoin === "USDC") {
    coin = envCoin;
  }

  /** Same currency on every line + total — mixed USD/USDT caused HSP 10001. */
  const displayCurrency = (invoice.currency || "USD").trim() || "USD";

  const reconciled = buildReconciledDisplay(invoice, displayCurrency);
  if ("error" in reconciled) {
    return NextResponse.json(
      { error: reconciled.error, fallback: true },
      { status: 400 }
    );
  }
  const { displayItems, amountStr } = reconciled;

  const paymentRequestId = `PAY-${invoice.id}`;

  try {
    const contents = buildCartMandateContents({
      invoiceId: invoice.id,
      paymentRequestId,
      amount: amountStr,
      displayCurrency,
      payTo,
      displayItems,
      coin,
      isTestnet,
    });

    const merchantJWT = await createMerchantJWT(contents);

    const result = (await submitCartMandate({
      contents,
      merchantAuthorization: merchantJWT,
    })) as Record<string, unknown>;

    const code = result.code as number | undefined;
    if (code !== undefined && code !== 0) {
      return NextResponse.json(
        {
          error: (result.msg as string) || "HSP rejected order",
          code,
          fallback: true,
        },
        { status: 400 }
      );
    }

    const data = (result.data as Record<string, unknown>) || result;
    const paymentUrl =
      (data.payment_url as string) ||
      (data.checkout_url as string) ||
      (data.paymentUrl as string) ||
      null;

    return NextResponse.json({
      paymentUrl,
      paymentRequestId: data.payment_request_id ?? data.paymentRequestId,
      multiPay: data.multi_pay,
      cartMandateId: (data.cart_mandate_id as string) || invoice.id,
      flowId: data.flow_id,
      raw: result,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[HSP] create-order:", error);
    return NextResponse.json(
      {
        error: msg,
        fallback: true,
        message: "HSP unavailable — use Direct Wallet Settlement.",
      },
      { status: 500 }
    );
  }
}
