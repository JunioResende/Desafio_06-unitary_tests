import request from 'supertest';
import { Connection } from 'typeorm';
import { app } from '../../../../app';
import createConnection from '../../../../database'

let connection: Connection;
let token: string;

describe("Get Balance Controller", () => {
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
    const authResponse = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "user@test.com",
      password: "123456",
    });

    token = authResponse.body.token;
  });

  afterAll(async () => {
    await  connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get a user balance", async () => {
    const balanceResponse = await request(app)
    .get("/api/v1/statements/balance")
    .set({
      Authorization: `Bearer ${token}`
    });

    expect(balanceResponse.status).toBe(200);
  });

  it("should not be able to get the balance with a invalid token", async () => {
    const balanceResponse = await request(app)
    .get("/api/v1/statements/balance")
    .set({
      Authorization: "Bearer InvalidToken"
    });

    expect(balanceResponse.status).toBe(401);
  });

  it("should not be able to get a balance of a nonexistent user", async () => {
    await connection.query("DELETE FROM users WHERE email = 'user@test.com'");

    const balanceResponse = await request(app)
    .get("/api/v1/statements/balance")
    .set({
      Authorization: `Bearer ${token}`
    });

    expect(balanceResponse.status).toBe(404);
  });
});