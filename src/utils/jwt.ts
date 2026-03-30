import crypto from "node:crypto";

const base64UrlEncode = (input: Buffer) =>
  input
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const base64UrlDecode = (input: string) => {
  const padLength = (4 - (input.length % 4)) % 4;
  const base64 = `${input}${"=".repeat(padLength)}`
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  return Buffer.from(base64, "base64");
};

export type JwtPayload = Record<string, unknown>;

const buildSignature = (signatureBase: string, secret: string) =>
  base64UrlEncode(
    crypto.createHmac("sha256", secret).update(signatureBase).digest(),
  );

export const signJwt = (
  payload: Record<string, unknown>,
  secret: string,
  expiresInSeconds: number,
): string => {
  if (!secret) {
    throw new Error("JWT secret is required");
  }

  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const basePayload = { iat: now, exp: now + expiresInSeconds };
  const encodedHeader = base64UrlEncode(Buffer.from(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(
    Buffer.from(JSON.stringify({ ...payload, ...basePayload })),
  );
  const signatureBase = `${encodedHeader}.${encodedPayload}`;
  const signature = buildSignature(signatureBase, secret);

  return `${signatureBase}.${signature}`;
};

const safeCompare = (first: string, second: string) => {
  const firstBuffer = Buffer.from(first, "ascii");
  const secondBuffer = Buffer.from(second, "ascii");

  if (firstBuffer.length !== secondBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(firstBuffer, secondBuffer);
};

const decodePayload = (encodedPayload: string) => {
  const payloadBuffer = base64UrlDecode(encodedPayload);
  const payloadText = payloadBuffer.toString("utf8");
  const payload = JSON.parse(payloadText);

  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid token payload");
  }

  return payload as JwtPayload;
};

const extractSignatureParts = (token: string) => {
  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new Error("Invalid JWT structure");
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error("Invalid JWT structure");
  }

  return { encodedHeader, encodedPayload, signature };
};

export const verifyJwt = (token: string, secret: string): JwtPayload => {
  if (!secret) {
    throw new Error("JWT secret is required");
  }
  if (!token) {
    throw new Error("Token is required");
  }

  const { encodedHeader, encodedPayload, signature } =
    extractSignatureParts(token);
  const signatureBase = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = buildSignature(signatureBase, secret);

  if (!safeCompare(signature, expectedSignature)) {
    throw new Error("Invalid token signature");
  }

  const payload = decodePayload(encodedPayload);
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = payload.exp;

  if (typeof expiresAt !== "number" || Number.isNaN(expiresAt)) {
    throw new Error("Token missing expiration");
  }

  if (expiresAt < now) {
    throw new Error("Token expired");
  }

  return payload;
};
