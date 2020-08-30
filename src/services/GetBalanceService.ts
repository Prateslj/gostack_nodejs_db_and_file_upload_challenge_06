import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';

interface BalanceIf {
  income: number;
  outcome: number;
  total: number;
}

class GetBalanceService {
  private transactionsRepository: TransactionsRepository;

  constructor(transactionsRepository: TransactionsRepository) {
    this.transactionsRepository = transactionsRepository;
  }

  public async execute(): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const allTransactions = await transactionsRepository.find();

    const balance = await transactionsRepository.getBalance();

    const balanceResult = {
      allTransactions,
      balance,
    };

    return balanceResult;
  }
}

export default GetBalanceService;
