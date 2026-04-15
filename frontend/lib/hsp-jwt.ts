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
