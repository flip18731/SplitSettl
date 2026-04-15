import crypto from "crypto";
import { canonicalJSON } from "./hsp-canonical";
import { CONTRACT_ADDRESS } from "./contract";

const HSP_BASE =
  process.env.HSP_API_BASE?.replace(/\/$/, "") ||
  "https://merchant-qa.hashkeymerchant.com";

const APP_KEY = process.env.HSP_APP_KEY?.trim() || "";
const APP_SECRET = process.env.HSP_APP_SECRET?.trim() || "";

function hmacSign(secret: string, message: string): string {
  return crypto.createHmac("sha256", secret).update(message, "utf8").digest("hex");
}

function sha256hex(input: string): string {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

export function signRequest(
  method: string,
  path: string,
  query: string,
  body: unknown
): { signature: string; timestamp: string; nonce: string } {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString("hex");
  const bodyHash = body != null ? sha256hex(canonicalJSON(body)) : "";
  const message = `${method.toUpperCase()}\n${path}\n${query}\n${bodyHash}\n${timestamp}\n${nonce}`;
  const signature = hmacSign(APP_SECRET, message);
  return { signature, timestamp, nonce };
}

export function isHSPConfigured(): boolean {
  return Boolean(APP_KEY && APP_SECRET);
}

/** @deprecated use isHSPConfigured */
export function isHspClientConfigured(): boolean {
  return isHSPConfigured();
}

/** Official token metadata (HSP / x402 docs). */
export const HSP_TOKENS = {
  testnet: {
    USDC: {
      address: "0x79AEc4EeA31D50792F61D1Ca0733C18c89524C9e",
      decimals: 6,
      protocol: "eip3009",
    },
    USDT: {
      address: "0x372325443233fEbaC1F6998aC750276468c83CC6",
      decimals: 6,
      protocol: "permit2",
    },
  },
  mainnet: {
    USDC: {
      address: "0x054ed45810DbBAb8B27668922D110669c9D88D0a",
      decimals: 6,
      protocol: "eip3009",
    },
    USDT: {
      address: "0xF1B50eD67A9e2CC94Ad3c477779E2d4cBfFf9029",
      decimals: 6,
      protocol: "permit2",
    },
  },
} as const;

function toPublicApiPath(merchantPath: string): string {
  return merchantPath
    .replace("/api/v1/merchant/orders/reusable", "/api/v1/public/cart-mandate/multi-pay")
    .replace("/api/v1/merchant/orders", "/api/v1/public/cart-mandate")
    .replace("/api/v1/merchant/payments/reusable", "/api/v1/public/payment/multi-pay")
    .replace("/api/v1/merchant/payments", "/api/v1/public/payment");
}

function shouldRetryAlternatePath(
  res: Response,
  data: unknown
): boolean {
  if (res.status === 404) return true;
  if (!data || typeof data !== "object") return false;
  const r = data as Record<string, unknown>;
  if ("code" in r && r.code !== 0 && r.code !== undefined) return true;
  return false;
}

async function hspFetchOnce(
  method: string,
  path: string,
  query: string,
  body?: unknown
): Promise<{ res: Response; data: unknown; text: string }> {
  const { signature, timestamp, nonce } = signRequest(method, path, query, body ?? null);
  const url = `${HSP_BASE}${path}${query ? `?${query}` : ""}`;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-App-Key": APP_KEY,
      "X-Signature": signature,
      "X-Timestamp": timestamp,
      "X-Nonce": nonce,
    },
    ...(body !== undefined ? { body: canonicalJSON(body) } : {}),
  });

  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  return { res, data, text };
}

/**
 * HMAC-signed request to HashKey Merchant. Tries `/api/v1/merchant/...` first, then `/api/v1/public/...` if needed.
 */
export async function hspFetch(
  method: string,
  path: string,
  query = "",
  body?: unknown
): Promise<unknown> {
  if (!APP_KEY || !APP_SECRET) {
    throw new Error("HSP credentials not configured");
  }

  let { res, data, text } = await hspFetchOnce(method, path, query, body);

  if (path.includes("/merchant/") && shouldRetryAlternatePath(res, data)) {
    const altPath = toPublicApiPath(path);
    if (altPath !== path) {
      const second = await hspFetchOnce(method, altPath, query, body);
      res = second.res;
      data = second.data;
      text = second.text;
    }
  }

  if (!res.ok) {
    throw new Error(`HSP ${res.status}: ${text || res.statusText}`);
  }

  return data;
}

export type HspDisplayItem = {
  label: string;
  amount: { currency: string; value: string };
};

export type BuildCartParams = {
  invoiceId: string;
  paymentRequestId: string;
  amount: string;
  payTo: string;
  displayItems: HspDisplayItem[];
  coin: "USDC" | "USDT";
  isTestnet: boolean;
};

/** Build `cart_mandate.contents` — must match what you sign in `createMerchantJWT`. */
export function buildCartMandateContents(params: BuildCartParams): Record<string, unknown> {
  const network = params.isTestnet ? "hashkey-testnet" : "hashkey";
  const chainId = params.isTestnet ? 133 : 177;
  const tokens = params.isTestnet ? HSP_TOKENS.testnet : HSP_TOKENS.mainnet;
  const token = tokens[params.coin];

  return {
    id: params.invoiceId,
    user_cart_confirmation_required: true,
    payment_request: {
      method_data: [
        {
          supported_methods: "https://www.x402.org/",
          data: {
            x402Version: 2,
            network,
            chain_id: chainId,
            contract_address: token.address,
            pay_to: params.payTo,
            coin: params.coin,
          },
        },
      ],
      details: {
        id: params.paymentRequestId,
        display_items: params.displayItems,
        total: {
          label: "Total",
          amount: { currency: "USD", value: params.amount },
        },
      },
    },
    cart_expiry: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    merchant_name: process.env.HSP_MERCHANT_NAME || "SplitSettl",
  };
}

const defaultRedirect = () =>
  `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invoice?hsp=complete`;

/** Submit cart mandate (POST) — `contents` must match JWT `cart_hash` input. */
export async function submitCartMandate(params: {
  contents: Record<string, unknown>;
  merchantAuthorization: string;
  redirectUrl?: string;
}): Promise<unknown> {
  const body = {
    cart_mandate: {
      contents: params.contents,
      merchant_authorization: params.merchantAuthorization,
    },
    redirect_url: params.redirectUrl ?? defaultRedirect(),
  };

  return hspFetch("POST", "/api/v1/merchant/orders", "", body);
}

/**
 * High-level: builds cart body and POSTs (caller supplies ES256K JWT over `contents`).
 */
export async function createHSPOrder(params: {
  invoiceId: string;
  paymentRequestId: string;
  amount: string;
  payTo: string;
  displayItems: HspDisplayItem[];
  coin: "USDC" | "USDT";
  isTestnet: boolean;
  merchantJWT: string;
  redirectUrl?: string;
}): Promise<unknown> {
  const contents = buildCartMandateContents({
    invoiceId: params.invoiceId,
    paymentRequestId: params.paymentRequestId,
    amount: params.amount,
    payTo: params.payTo,
    displayItems: params.displayItems,
    coin: params.coin,
    isTestnet: params.isTestnet,
  });

  return submitCartMandate({
    contents,
    merchantAuthorization: params.merchantJWT,
    redirectUrl: params.redirectUrl,
  });
}

export async function queryPayment(cartMandateId: string): Promise<unknown> {
  const q = new URLSearchParams({
    cart_mandate_id: cartMandateId,
  }).toString();
  return hspFetch("GET", "/api/v1/merchant/payments", q);
}

export async function queryPaymentByFlow(flowId: string): Promise<unknown> {
  const q = new URLSearchParams({ flow_id: flowId }).toString();
  return hspFetch("GET", "/api/v1/merchant/payments", q);
}

/** Default payee: SplitSettl contract or `HSP_PAY_TO_ADDRESS`. */
export function getDefaultPayToAddress(): string {
  const fromEnv = process.env.HSP_PAY_TO_ADDRESS?.trim();
  if (fromEnv) return fromEnv;
  return CONTRACT_ADDRESS;
}
