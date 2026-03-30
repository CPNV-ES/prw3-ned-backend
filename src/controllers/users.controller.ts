import type { NextFunction, Request, Response } from "express";

import { createBadRequestError } from "../utils/http-error";
import { createUser, listUsers, getUserById } from "../services/users.service";

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

export async function getUserController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = parseInt(req.params.id as string, 10);

    if (isNaN(userId)) {
      throw createBadRequestError("Invalid user ID");
    }

    const user = await getUserById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function listUsersController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    if (page < 1 || limit < 1) {
      throw createBadRequestError("Page and limit must be positive integers");
    }

    const users = await listUsers(page, limit);

    res.json(users);
  } catch (error) {
    next(error);
  }
}
