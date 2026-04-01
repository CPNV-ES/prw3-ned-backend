import type { CookieOptions, Request } from "express";

import { jwtExpiresInSeconds, nodeEnv } from "./env";

export const SESSION_COOKIE_NAME = "session";

export const sessionCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: nodeEnv === "production",
  maxAge: jwtExpiresInSeconds * 1000,
  path: "/",
};

const parseCookies = (cookieHeader?: string): Record<string, string> => {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(";").reduce<Record<string, string>>((cookies, part) => {
    const [rawName, ...rawValueParts] = part.trim().split("=");

    if (!rawName || rawValueParts.length === 0) {
      return cookies;
    }

    cookies[rawName] = decodeURIComponent(rawValueParts.join("="));
    return cookies;
  }, {});
};

export const extractSessionCookieToken = (req: Request): string | null => {
  const cookies = parseCookies(req.headers.cookie);
  return cookies[SESSION_COOKIE_NAME] ?? null;
};
