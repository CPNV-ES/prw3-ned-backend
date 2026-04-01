import { randomBytes } from "crypto";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import path from "path";

const PRIVATE_STORAGE_ROOT = path.resolve(process.cwd(), "storages/private");
const JWT_SECRET_PATH = path.join(PRIVATE_STORAGE_ROOT, "jwt-secret");

const generateJwtSecret = () => randomBytes(64).toString("hex");

const ensureJwtSecretFile = (): string => {
  mkdirSync(PRIVATE_STORAGE_ROOT, { recursive: true });

  if (!existsSync(JWT_SECRET_PATH)) {
    writeFileSync(JWT_SECRET_PATH, `${generateJwtSecret()}\n`, {
      encoding: "utf8",
      mode: 0o600,
    });
  }

  chmodSync(JWT_SECRET_PATH, 0o600);

  const secret = readFileSync(JWT_SECRET_PATH, "utf8").trim();

  if (!secret) {
    throw new Error(`JWT secret file is empty: ${JWT_SECRET_PATH}`);
  }

  return secret;
};

const jwtSecret = ensureJwtSecretFile();

export { jwtSecret, JWT_SECRET_PATH, PRIVATE_STORAGE_ROOT };
