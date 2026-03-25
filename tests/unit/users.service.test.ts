const findUniqueMock: jest.MockedFunction<() => Promise<unknown>> = jest.fn();
const createMock: jest.MockedFunction<() => Promise<unknown>> = jest.fn();
const hashPasswordMock: jest.MockedFunction<
  (password: string) => Promise<string>
> = jest.fn();

jest.mock("../../src/utils/prisma", () => ({
  prisma: {
    users: {
      findUnique: findUniqueMock,
      create: createMock,
    },
  },
}));

jest.mock("../../src/utils/password", () => ({
  hashPassword: hashPasswordMock,
}));

import { createUser } from "../../src/services/users.service";

describe("users service", () => {
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
