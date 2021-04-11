import request from 'supertest';
import { Connection } from 'typeorm';
import { app } from '../../../../app';
import createConnection from '../../../../database'

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new user", async () => {
    const response = await request(app)
    .post("/api/v1/users")
    .send({
      name: "User Test",
      email: "user@test.com",
      password: "123456",
    });
    expect(response.status).toBe(201);
  });

  it("should not be able to create a new user with an existing email", async () => {
  const response = await request(app)
  .post("/api/v1/users")
  .send({
      name: "User Test",
      email: "user@test.com",
      password: "123456",
    });
    expect(response.status).toBe(400);
  })
});



