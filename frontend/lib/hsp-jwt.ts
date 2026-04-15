import crypto from "crypto";
import { SignJWT, importPKCS8 } from "jose";
import { canonicalJSON, sha256hex } from "./hsp-canonical";

const MERCHANT_PRIVATE_KEY_PEM =
  process.env.HSP_MERCHANT_PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "";

async function loadSigningKey() {
  const pem = MERCHANT_PRIVATE_KEY_PEM.trim();
  if (!pem) {
    throw new Error("HSP_MERCHANT_PRIVATE_KEY is not set");
  }
  try {
    return await importPKCS8(pem, "ES256K");
  } catch {
    return crypto.createPrivateKey(pem);
  }
}

/**
 * ES256K JWT for `merchant_authorization`.
 * `cart_hash` = SHA-256 (hex) over canonical JSON of cart `contents` (must match request body).
 */
/** Decode JWT payload (no verify) — debug / invariant checks only. */
export function decodeMerchantJwtPayload(jwt: string): { cart_hash?: string } {
  const parts = jwt.split(".");
  if (parts.length < 2) return {};
  const json = Buffer.from(parts[1]!, "base64url").toString("utf8");
  return JSON.parse(json) as { cart_hash?: string };
}

/** Ensures `cart_hash` in JWT matches SHA256(canonicalJSON(contents)). */
export function assertJwtCartHashMatches(
  contents: Record<string, unknown>,
  jwt: string
): void {
  const canonical = canonicalJSON(contents);
  const expected = sha256hex(canonical);
  const payload = decodeMerchantJwtPayload(jwt);
  if (payload.cart_hash !== expected) {
    throw new Error(
      `HSP internal: cart_hash mismatch (jwt vs contents). Expected ${expected.slice(0, 16)}…`
    );
  }
}

export async function createMerchantJWT(
  cartContents: Record<string, unknown>
): Promise<string> {
  const canonical = canonicalJSON(cartContents);
  const cartHash = sha256hex(canonical);

  const privateKey = await loadSigningKey();

  return new SignJWT({
    cart_hash: cartHash,
  })
    .setProtectedHeader({
      alg: "ES256K",
      typ: "JWT",
    } as { alg: "ES256K"; typ: string })
    .setIssuer(process.env.HSP_JWT_ISSUER || "SplitSettl")
    .setSubject(process.env.HSP_JWT_SUBJECT || "SplitSettl")
    .setAudience(process.env.HSP_JWT_AUDIENCE || "HashkeyMerchant")
    .setIssuedAt()
    .setExpirationTime("1h")
    .setJti(`JWT-${Date.now()}-${crypto.randomBytes(8).toString("hex")}`)
    .sign(privateKey);
}
