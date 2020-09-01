import { getCustomRepository, getRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import Transaction from '../models/Transaction';

interface BalanceIf {
  income: number;
  outcome: number;
  total: number;
}

interface CompleteTransactionIf {
  id: string;
  title: string;
  value: number;
  type: string;
  createt_at: Date;
  updatet_at: Date;
  category: Category;
}

class GetBalanceService {
  public async execute(): Promise<Transaction> {
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const categories = await categoriesRepository.find();
    const transactions = await transactionsRepository.find();

    const balance = await transactionsRepository.getBalance();

    const completeTransactions: CompleteTransactionIf[] = transactions.map(
      transaction => {
        const completeTransaction = transaction;

        completeTransaction.category = categories.find(
          category => category.id === transaction.category_id,
        );

        delete completeTransaction.category_id;

        return completeTransaction;
      },
    );

    return { transactions: completeTransactions, balance };
    // return { completeTransactions };
  }
}

export default GetBalanceService;
