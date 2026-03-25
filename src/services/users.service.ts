import { prisma } from "../utils/prisma";

import { createConflictError } from "../utils/http-error";
import { hashPassword } from "../utils/password";

export interface CreateUserInput {
  name: string;
  username: string;
  password: string;
}

export interface UserOutput {
  id: number;
  name: string;
  username: string;
}

export async function createUser({
  name,
  username,
  password,
}: CreateUserInput): Promise<UserOutput> {
  const existingUser = await prisma.users.findUnique({ where: { username } });

  if (existingUser) {
    throw createConflictError("Username already exists");
  }

  const hashedPassword = await hashPassword(password);

  return prisma.users.create({
    data: { name, username, password: hashedPassword },
    select: { id: true, name: true, username: true },
  });
}
