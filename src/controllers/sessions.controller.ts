import type { NextFunction, Request, Response } from "express";

import {
  createBadRequestError,
  createUnauthorizedError,
} from "../utils/http-error";
import {
  createSession,
  getCurrentSession,
  revokeSessionToken,
} from "../services/sessions.service";

const BEARER_PREFIX = "Bearer ";

const extractAuthorizationToken = (req: Request) => {
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

export async function createSessionController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { username, password } = req.body ?? {};

    if (!username || !password) {
      throw createBadRequestError("Username and password are required");
    }

    const session = await createSession({ username, password });
    res.status(200).json(session);
  } catch (error) {
    next(error);
  }
}

export async function getCurrentSessionController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = extractAuthorizationToken(req);
    const session = await getCurrentSession(token);
    res.status(200).json(session);
  } catch (error) {
    next(error);
  }
}

export async function deleteSessionController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = extractAuthorizationToken(req);
    await revokeSessionToken(token);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
}
