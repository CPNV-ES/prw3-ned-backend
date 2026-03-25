import type { NextFunction, Request, Response } from "express";

import { createBadRequestError } from "../utils/http-error";
import { createUser } from "../services/users.service";

export async function createUserController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { name, username, password } = req.body ?? {};

    if (!name || !username || !password) {
      throw createBadRequestError("Name, username, and password are required");
    }

    const user = await createUser({ name, username, password });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}
