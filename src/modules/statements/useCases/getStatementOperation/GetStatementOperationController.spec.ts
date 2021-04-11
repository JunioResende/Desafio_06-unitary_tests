import request from 'supertest'
import { Connection } from 'typeorm';
import { app } from '../../../../app';
import createConnection from '../../../../database'

let connection: Connection;
let token: string;
let statementId: string;

describe("Get Statement Operation Controller", () => {
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

    const statementResponse = await request(app)
    .post("/api/v1/statements/deposit")
    .set({
      Authorization: `Bearer ${token}`,
    })
    .send({
      amount: 100,
      description: "Deposit Description",
    });

    statementId = statementResponse.body.id;
  });

  afterAll(async () => {
   await  connection.dropDatabase();
   await connection.close();
  });

  it("should be able to get a user statement operation", async () => {
    const statementResponse = await request(app)
    .get(`/api/v1/statements/${statementId}`)
    .set({
      Authorization: `Bearer ${token}`
    });

    expect(statementResponse.status).toBe(200);
  });

  it("should not be able to get a nonexistent statement operation ", async () => {
    const statementResponse = await request(app)
    .get("/api/v1/statements/48daa2ee-89d9-43a6-a2e2-6a090f548ca5")
    .set({
      Authorization: `Bearer ${token}`
    });

    expect(statementResponse.status).toBe(404);
  });

  it("should not be able to get a statement operation of a nonexistent user", async () => {
    await connection.query("DELETE FROM users WHERE email = 'user@test.com'");

    const statementResponse = await request(app)
    .get(`/api/v1/statements/${statementId}`)
    .set({
      Authorization: `Bearer ${token}`
    });

    expect(statementResponse.status).toBe(404);
  });
});