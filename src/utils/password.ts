import { randomBytes, scrypt as scryptCallback } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback);
const SALT_BYTES = 16;
const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES).toString("hex");
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(
  hashedPassword: string,
  plainPassword: string,
): Promise<boolean> {
  const [salt, storedKey] = hashedPassword.split(":");
  if (!salt || !storedKey) {
    return false;
  }

  const derivedKey = (await scrypt(plainPassword, salt, KEY_LENGTH)) as Buffer;
  return derivedKey.toString("hex") === storedKey;
}
