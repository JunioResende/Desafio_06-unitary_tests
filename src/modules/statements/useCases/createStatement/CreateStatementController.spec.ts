import request from 'supertest';
import { Connection } from 'typeorm';
import { app } from '../../../../app';
import createConnection from '../../../../database'

let connection: Connection;
let token: string;

describe('Create Statement Controller', () => {
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

  it("should be able to create a deposit", async () => {
    const depositResponse = await request(app)
    .post("/api/v1/statements/deposit")
    .set({
      Authorization: `Bearer ${token}`
    })
    .send({
      amount: 100,
      description: "Deposit Test",
    });

    expect(depositResponse.status).toBe(201);
    expect(depositResponse.body.type).toBe('deposit');
  });

  it("should be able to create a withdraw", async () => {
    const withdrawResponse = await request(app)
    .post("/api/v1/statements/withdraw")
    .set({
      Authorization: `Bearer ${token}`
    })
    .send({
      amount: 100,
      description: "Withdraw Test",
    });

    expect(withdrawResponse.status).toBe(201);
    expect(withdrawResponse.body.type).toBe('withdraw');
  });

  it("should not be able to create a new withdraw statement with Insufficient Funds", async () => {
    const withdrawResponse = await request(app)
    .post("/api/v1/statements/withdraw")
    .set({
      Authorization: `Bearer ${token}`
    })
    .send({
      amount: 100,
      description: 'Withdraw Test',
    });

    expect(withdrawResponse.status).toBe(400);
  });

  it("should not be able to create a statement with an invalid user token", async () => {
    const depositResponse = await request(app)
    .post("/api/v1/statements/deposit")
    .set({
      Authorization: "Bearer InvalidToken",
    })
    .send({
      amount: 100,
      description: "Deposit Test",
    });

    expect(depositResponse.status).toBe(401);
  });

  it("should not be able to create a statement to a nonexistent user", async () => {
    await connection.query("DELETE FROM users WHERE email = 'user@test.com'");

    const depositResponse = await request(app)
    .post("/api/v1/statements/withdraw")
    .set({
      Authorization: `Bearer ${token}`
    })
    .send({
      amount: 100,
      description: 'Withdraw Test'
    });

    expect(depositResponse.status).toBe(404);
  });
});