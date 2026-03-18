import { jest } from "@jest/globals";

const findUniqueMock = jest.fn<() => Promise<unknown>>();
const createMock = jest.fn<() => Promise<unknown>>();
const hashPasswordMock = jest.fn<(password: string) => Promise<string>>();

jest.unstable_mockModule("../../src/utils/prisma.js", () => ({
  prisma: {
    users: {
      findUnique: findUniqueMock,
      create: createMock,
    },
  },
}));

jest.unstable_mockModule("../../src/utils/password.js", () => ({
  hashPassword: hashPasswordMock,
}));

type UsersServiceModule = typeof import("../../src/services/users.service.js");

let createUser: UsersServiceModule["createUser"];

describe("users service", () => {
  beforeAll(async () => {
    ({ createUser } = await import("../../src/services/users.service.js"));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("hashes the password and creates a new user", async () => {
    const payload = {
      name: "Sample",
      username: "sample",
      password: "super-secret",
    };
    findUniqueMock.mockResolvedValueOnce(null);
    hashPasswordMock.mockResolvedValueOnce("hashed-value");
    const createdUser = {
      id: 1,
      name: payload.name,
      username: payload.username,
    };
    createMock.mockResolvedValueOnce(createdUser);

    const result = await createUser(payload);

    expect(result).toEqual(createdUser);
    expect(hashPasswordMock).toHaveBeenCalledWith(payload.password);
    expect(createMock).toHaveBeenCalledWith({
      data: {
        name: payload.name,
        username: payload.username,
        password: "hashed-value",
      },
      select: { id: true, name: true, username: true },
    });
  });

  it("throws a conflict if the username already exists", async () => {
    const payload = {
      name: "Sample",
      username: "sample",
      password: "super-secret",
    };
    findUniqueMock.mockResolvedValueOnce({
      id: 1,
      username: payload.username,
      name: payload.name,
    });

    await expect(createUser(payload)).rejects.toMatchObject({
      status: 409,
      message: "Username already exists",
    });

    expect(hashPasswordMock).not.toHaveBeenCalled();
    expect(createMock).not.toHaveBeenCalled();
  });
});
