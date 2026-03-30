import { prisma } from "../utils/prisma";

import { jwtExpiresInSeconds, jwtSecret } from "../config/env";
import { createUnauthorizedError } from "../utils/http-error";
import { signJwt, verifyJwt, type JwtPayload } from "../utils/jwt";
import { verifyPassword } from "../utils/password";
import { isTokenRevoked, persistRevokedToken } from "./revoked-tokens.service";

export interface CreateSessionInput {
  username: string;
  password: string;
}

export interface SessionOutput {
  token: string;
  expiresAt: string;
  user: {
    id: number;
    name: string;
    username: string;
  };
}

export interface CurrentSessionOutput {
  expiresAt: string;
  user: {
    id: number;
    name: string;
    username: string;
  };
}

export interface SessionTokenPayload extends Record<string, unknown> {
  sub: number;
  username: string;
  exp: number;
  iat: number;
}

const ensureSessionTokenPayload = (
  payload: JwtPayload,
): payload is SessionTokenPayload =>
  typeof payload.sub === "number" &&
  Number.isFinite(payload.sub) &&
  typeof payload.username === "string" &&
  typeof payload.exp === "number" &&
  Number.isFinite(payload.exp) &&
  typeof payload.iat === "number" &&
  Number.isFinite(payload.iat);

export function verifySessionToken(token: string): SessionTokenPayload {
  try {
    const payload = verifyJwt(token, jwtSecret);

    if (!ensureSessionTokenPayload(payload)) {
      throw new Error("Token payload does not contain required claims");
    }

    return payload;
  } catch {
    throw createUnauthorizedError("Invalid or expired token");
  }
}

const mapUserToSessionUser = (user: {
  id: number;
  username: string;
  name: string;
}) => ({
  id: user.id,
  username: user.username,
  name: user.name,
});

const ensureSessionTokenIsActive = async (
  token: string,
): Promise<SessionTokenPayload> => {
  const payload = verifySessionToken(token);

  if (await isTokenRevoked(token)) {
    throw createUnauthorizedError("Token has been revoked");
  }

  return payload;
};

export async function getCurrentSession(
  token: string,
): Promise<CurrentSessionOutput> {
  const payload = await ensureSessionTokenIsActive(token);

  const user = await prisma.users.findUnique({ where: { id: payload.sub } });

  if (!user) {
    throw createUnauthorizedError("Invalid or expired token");
  }

  return {
    expiresAt: new Date(payload.exp * 1000).toISOString(),
    user: mapUserToSessionUser(user),
  };
}

export async function createSession({
  username,
  password,
}: CreateSessionInput): Promise<SessionOutput> {
  const user = await prisma.users.findUnique({ where: { username } });

  if (!user) {
    throw createUnauthorizedError("Invalid username or password");
  }

  const isPasswordValid = await verifyPassword(user.password, password);

  if (!isPasswordValid) {
    throw createUnauthorizedError("Invalid username or password");
  }

  const token = signJwt(
    { sub: user.id, username: user.username },
    jwtSecret,
    jwtExpiresInSeconds,
  );

  return {
    token,
    expiresAt: new Date(Date.now() + jwtExpiresInSeconds * 1000).toISOString(),
    user: mapUserToSessionUser(user),
  };
}

export async function revokeSessionToken(token: string): Promise<void> {
  const payload = verifySessionToken(token);
  await persistRevokedToken(token, new Date(payload.exp * 1000));
}
