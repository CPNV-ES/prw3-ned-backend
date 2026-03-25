import type { NextFunction, Request, Response } from "express";

import { createUnauthorizedError } from "../utils/http-error";
import { getCurrentSession } from "../services/sessions.service";

const BEARER_PREFIX = "Bearer ";

export const extractAuthorizationToken = (req: Request): string => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith(BEARER_PREFIX)) {
    throw createUnauthorizedError("Missing or invalid authorization header");
  }

  const token = authorization.slice(BEARER_PREFIX.length).trim();

  if (!token) {
    throw createUnauthorizedError("Missing or invalid authorization header");
  }

  return token;
};

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = extractAuthorizationToken(req);
    await getCurrentSession(token);
    next();
  } catch (error) {
    next(error);
  }
}
