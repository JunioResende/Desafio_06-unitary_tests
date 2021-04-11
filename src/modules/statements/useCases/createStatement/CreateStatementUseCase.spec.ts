import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

import { OperationType, Statement } from "../../entities/Statement"
import { CreateStatementError } from "./CreateStatementError";

let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;


describe("Create User", ()=>{
  beforeEach(()=>{
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });
  it("should be able to create a new statement", async () => {
    const user: ICreateUserDTO = {
      name: "User Test",
      email: "user@test.com",
      password: "123456",
    };
    const createdUser = await createUserUseCase.execute(user);
    const {id} = createdUser;
    const statement: ICreateStatementDTO= {
      user_id: id as string,
      description: "Statement Description",
      amount: 100,
      type: 'deposit' as OperationType,
    }
    const statementOperation = await createStatementUseCase.execute(statement);
    expect(statementOperation).toHaveProperty("id");
    expect(statementOperation).toBeInstanceOf(Statement);
  });

  it("should not be able to create a statement to a nonexistent user", async () => {
    expect(async ()=>{
      const statement: ICreateStatementDTO= {
        user_id: "Invalid Id",
        description: "Statement Description",
        amount: 100,
        type: 'deposit' as OperationType,
      };
      await createStatementUseCase.execute(statement);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to create a new withdraw statement with Insufficient Funds", async () => {
    expect( async ()=> {
      const user: ICreateUserDTO = {
        name: "User Test",
        email: "user@test.com",
        password: "123456",
      };
      const createdUser = await createUserUseCase.execute(user);
      const {id} = createdUser;
      
      const depositStatement: ICreateStatementDTO= {
        user_id: id as string,
        description: "Deposit Statement",
        amount: 100,
        type: 'deposit' as OperationType,
      }
      await createStatementUseCase.execute(depositStatement);
  
      const withdrawStatement: ICreateStatementDTO= {
        user_id: id as string,
        description: "Withdraw Statement",
        amount: 200,
        type: 'withdraw' as OperationType,
      }
      await createStatementUseCase.execute(withdrawStatement);
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});