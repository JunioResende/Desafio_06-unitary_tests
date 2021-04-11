import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;


describe("Create User", ()=>{
  beforeEach(()=>{
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });
  it("Should be able to authenticate an user", async () => {
    const user: ICreateUserDTO = {
      name: "User Test",
      email: "user@test.com",
      password: "123456",
    };
    await createUserUseCase.execute(user);
    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });
    expect(result).toHaveProperty("token");
  });

  it("Should not be able to authenticate a nonexistent user", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "User Test Error",
        email: "user@test.com",
        password: "123456",
      };
      await createUserUseCase.execute(user);
      await authenticateUserUseCase.execute({
        email: "incorrect email",
        password: user.password,
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should not be able to authenticate an user with incorrect password", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "User Test Error",
        email: "user@test.com",
        password: "123456",
      };
      await createUserUseCase.execute(user);
      await authenticateUserUseCase.execute({
        email: user.email,
        password: "incorrect password",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});

