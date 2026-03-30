import crypto from "node:crypto";

const upsertMock: jest.MockedFunction<
  (args: {
    where: { token: string };
    update: { expires_at: Date };
    create: { token: string; expires_at: Date };
  }) => Promise<unknown>
> = jest.fn();
const findUniqueMock: jest.MockedFunction<
  (args: { where: { token: string } }) => Promise<unknown>
> = jest.fn();

jest.mock("../../src/utils/prisma", () => ({
  prisma: {
    revoked_tokens: {
      upsert: upsertMock,
      findUnique: findUniqueMock,
    },
  },
}));

import {
  isTokenRevoked,
  persistRevokedToken,
} from "../../src/services/revoked-tokens.service";

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

describe("revoked-tokens service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("hashes tokens and persists them via Prisma", async () => {
    const token = "session-token";
    const expiresAt = new Date("2026-03-18T12:00:00.000Z");

    await persistRevokedToken(token, expiresAt);

    const expectedHash = hashToken(token);
    expect(upsertMock).toHaveBeenCalledWith({
      where: { token: expectedHash },
      update: { expires_at: expiresAt },
      create: { token: expectedHash, expires_at: expiresAt },
    });
  });

  it("returns true when the token has already been revoked", async () => {
    const token = "revoked-token";
    findUniqueMock.mockResolvedValueOnce({ token: hashToken(token) });

    await expect(isTokenRevoked(token)).resolves.toBe(true);
    expect(findUniqueMock).toHaveBeenCalledWith({
      where: { token: hashToken(token) },
    });
  });

  it("returns false when the token is not in the store", async () => {
    const token = "missing-token";
    findUniqueMock.mockResolvedValueOnce(null);

    await expect(isTokenRevoked(token)).resolves.toBe(false);
    expect(findUniqueMock).toHaveBeenCalledWith({
      where: { token: hashToken(token) },
    });
  });
});
