import type { NextFunction, Request, Response } from "express";

interface HttpError extends Error {
  status?: number;
}

export default function errorHandler(
  err: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (process.env.NODE_ENV !== "test") {
    console.error(err);
  }

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
}
