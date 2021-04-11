import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { IGetBalanceDTO } from "./IGetBalanceDTO";



let getBalanceUseCase: GetBalanceUseCase;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Get Balance", () => {
  beforeEach(()=>{
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository,inMemoryStatementsRepository);
  });
  it("should be able to get a user balance", async () => {
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
    };
    const withDrawStatement: ICreateStatementDTO= {
      user_id: id as string,
      description: "Deposit Statement",
      amount: 50,
      type: 'withdraw' as OperationType,
    };

    const getBalance: IGetBalanceDTO = {
      user_id: id as string,
      with_statement: true,
    };

    await createStatementUseCase.execute(depositStatement);
    await createStatementUseCase.execute(withDrawStatement);
    const balance = await getBalanceUseCase.execute(getBalance);
    expect(balance.statement.length).toBe(2);
    expect(balance.balance).toBe(50);
  });

  it("should not be able to get a balance of a nonexistent user", async () => {
    expect(async ()=>{
      const getBalance: IGetBalanceDTO = {
        user_id: "Invalid Id",
        with_statement: true,
      };
      await getBalanceUseCase.execute(getBalance);
    }).rejects.toBeInstanceOf(GetBalanceError);
  });

});