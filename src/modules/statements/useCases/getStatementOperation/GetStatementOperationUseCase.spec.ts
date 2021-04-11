import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType, Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Get Statement Operation", () =>{
  beforeEach(()=>{
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository,inMemoryStatementsRepository);
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("should be able to get a user statement operation", async () => {
    const user: ICreateUserDTO = {
      name: "User Test",
      email: "user@test.com",
      password: "123456",
    };
    const createdUser = await createUserUseCase.execute(user);
    const {id: user_id} = createdUser;
    const depositStatement: ICreateStatementDTO= {
      user_id: user_id as string,
      description: "Deposit Statement",
      amount: 100,
      type: 'deposit' as OperationType,
    };
    
    const statement = await createStatementUseCase.execute(depositStatement);
    const {id: statement_id} = statement;
    const statementOperation = await getStatementOperationUseCase.execute({ 
      user_id: user_id as string,
      statement_id: statement_id as string,
    });
    expect(statementOperation).toBeInstanceOf(Statement);
    expect(statementOperation).toHaveProperty("id");
  });

  it("should not be able to get a statement operation of a nonexistent user", async () => {
    expect(async ()=>{
      const user: ICreateUserDTO = {
        name: "User Test",
        email: "user@test.com",
        password: "123456",
      };
      const createdUser = await createUserUseCase.execute(user);
      const {id: user_id} = createdUser;
      const depositStatement: ICreateStatementDTO= {
        user_id: user_id as string,
        description: "Deposit Statement",
        amount: 100,
        type: 'deposit' as OperationType,
      };
      
      const statement = await createStatementUseCase.execute(depositStatement);
      const {id: statement_id} = statement;
      await getStatementOperationUseCase.execute({ 
        user_id: "Invalid User Id",
        statement_id: statement_id as string,
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to get a nonexistent statement operation ", async () => {
    expect(async ()=>{
      const user: ICreateUserDTO = {
        name: "User Test",
        email: "user@test.com",
        password: "123456",
      };
      const createdUser = await createUserUseCase.execute(user);
      const {id: user_id} = createdUser;
      
      await getStatementOperationUseCase.execute({ 
        user_id: user_id as string,
        statement_id: "Invalid Statement Id",
      });
    }).rejects.toBeInstanceOf(AppError);
  });

});