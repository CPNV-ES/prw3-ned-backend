import request from "supertest";
import { jest } from "@jest/globals";

const createUserMock = jest.fn();

jest.unstable_mockModule("../../src/services/users.service", () => ({
  createUser: createUserMock,
}));

type AppModule = typeof import("../../src/app");

let app: AppModule["app"];

describe("POST /api/users", () => {
  beforeAll(async () => {
    ({ app } = await import("../../src/app"));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a user and returns the public fields", async () => {
    const newUser = { id: 1, name: "Sample User", username: "sample" };
    const payload = {
      name: "Sample User",
      username: "sample",
      password: "password",
    };
    createUserMock.mockResolvedValueOnce(newUser);

    const response = await request(app)
      .post("/api/users")
      .send(payload)
      .expect(201);

    expect(createUserMock).toHaveBeenCalledWith(payload);
    expect(response.body).toEqual(newUser);
  });
});
