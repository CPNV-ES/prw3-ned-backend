import type { NextFunction, Request, Response } from "express";

import {
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "../config/session-cookie";
import { createBadRequestError } from "../utils/http-error";
import {
  createSession,
  getCurrentSession,
  revokeSessionToken,
} from "../services/sessions.service";
import { extractAuthorizationToken } from "../middlewares/auth.middleware";

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

    const { token, ...session } = await createSession({ username, password });
    res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions);
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
    res.clearCookie(SESSION_COOKIE_NAME, {
      ...sessionCookieOptions,
      maxAge: undefined,
    });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
}
