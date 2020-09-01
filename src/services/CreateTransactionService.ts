import { getCustomRepository, getRepository } from 'typeorm';
// import AppError from '../errors/AppError';

import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';

interface TransactionI {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: TransactionI): Promise<Transaction> {
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionRepository);

    let categoryItem = await categoriesRepository.findOne({
      where: { title: category },
    });
    if (!categoryItem) {
      categoryItem = categoriesRepository.create({
        title: category,
      });
      await categoriesRepository.save(categoryItem);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryItem.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
