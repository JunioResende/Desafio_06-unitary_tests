import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase"
import { ICreateUserDTO } from "./ICreateUserDTO";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;


describe("Create User", ()=>{
  beforeEach(()=>{
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });
  it("should be able to create a new user", async () => {
    const user: ICreateUserDTO = {
      name: "User Test",
      email: "user@test.com",
      password: "123456",
    };
    await createUserUseCase.execute(user);
    const userCreated = await inMemoryUsersRepository.findByEmail(user.email);
    expect(userCreated).toHaveProperty("id");
  });

  it("should not be able to create a new user with an existing email", async () => {
    expect(async () => {
      const user1: ICreateUserDTO = {
        name: "User Test 1",
        email: "user@test.com",
        password: "123456",
      };
      const user2: ICreateUserDTO = {
        name: "User Test 2",
        email: "user@test.com",
        password: "654321",
      };
    await createUserUseCase.execute(user1);
    await createUserUseCase.execute(user2);
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});