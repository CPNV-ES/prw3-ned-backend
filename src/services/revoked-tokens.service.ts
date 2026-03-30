import { createHash } from "crypto";

import { prisma } from "../utils/prisma";

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export async function persistRevokedToken(
  token: string,
  expiresAt: Date,
): Promise<void> {
  const hashedToken = hashToken(token);

  await prisma.revoked_tokens.upsert({
    where: { token: hashedToken },
    update: { expires_at: expiresAt },
    create: {
      token: hashedToken,
      expires_at: expiresAt,
    },
  });
}

export async function isTokenRevoked(token: string): Promise<boolean> {
  const hashedToken = hashToken(token);
  const tokenRecord = await prisma.revoked_tokens.findUnique({
    where: { token: hashedToken },
  });
  return Boolean(tokenRecord);
}
