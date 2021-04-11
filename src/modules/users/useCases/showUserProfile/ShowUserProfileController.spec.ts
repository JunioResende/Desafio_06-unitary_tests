import request from 'supertest';
import { Connection } from 'typeorm';
import { app } from '../../../../app';
import createConnection from '../../../../database'

let connection: Connection;
let token: string;

describe("Show User Profile Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app)
    .post("/api/v1/users")
    .send({
      name: "User Test",
      email: "user@test.com",
      password: "123456",
    });
    const authenticateResponse = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "user@test.com",
      password: "123456",
    });

    token = authenticateResponse.body.token
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show an user profile", async () => {
    const response = await request(app)
    .get("/api/v1/profile")
    .set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("should not be able to show an user profile with invalid token", async () => {
    const response = await request(app)
    .get("/api/v1/profile")
    .set({
      Authorization: `Bearer InvalidToken`,
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "JWT invalid token!",
    });
  });

  it("should not be able to show an user profile without a token", async () => {
    const response = await request(app)
    .get("/api/v1/profile")

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "JWT token is missing!",
    });
  });

  it("should not be able to show a nonexistent user profile", async () => {
    await connection.query("DELETE FROM users WHERE email = 'user@test.com'");

    const response = await request(app)
    .get("/api/v1/profile")
    .set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "User not found",
    });
  });
});
