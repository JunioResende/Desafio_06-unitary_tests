import request from 'supertest';
import { Connection } from 'typeorm';
import { app } from '../../../../app';
import createConnection from '../../../../database'

let connection: Connection;

describe("Authenticate User Controller", () => {
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
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate an user", async () => {
    const response = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "user@test.com",
      password: "123456",
    });

    expect(response.status).toBe(200);
  });

  it("should not be able to authenticate an user with incorrect password", async () => {
    const response = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "user@test.com",
    	password: "incorrectpassword"
    });

    expect(response.status).toBe(401);
  });

  it("should not be able to authenticate a nonexistent user", async () => {
    const response = await request(app)
    .post('/api/v1/sessions')
    .send({
      email: "IncorrectEmail",
    	password: "123456"
    });

    expect(response.status).toBe(401);
  });
});
