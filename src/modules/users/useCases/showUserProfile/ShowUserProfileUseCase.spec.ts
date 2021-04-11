import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;


describe("Show User Profile", () => {
  beforeEach(()=>{
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  });
  it("should be able to show an user profile", async () => {
    const user: ICreateUserDTO = {
      name: "User Test",
      email: "user@test.com",
      password: "123456",
    };
    const createdUser = await createUserUseCase.execute(user);
    const {id} = createdUser;
    const userProfile = await showUserProfileUseCase.execute(id as string);
    expect(userProfile).toBeInstanceOf(User);
  });

  it("should not be able to show a nonexistent user profile", async () => {
    expect(async ()=>{
      await showUserProfileUseCase.execute("invalid_id");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});