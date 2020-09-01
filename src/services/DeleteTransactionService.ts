import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute({ id }): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionRepository);

    const transaction = await transactionsRepository.findOne({
      where: { id },
    });

    if (!transaction) {
      throw new AppError('Transaction not found!', 400);
    }

    const deletedTransaction = await transactionsRepository.remove(transaction);

    // await transactionsRepository.save();
    console.log('deleted transaction após o if:', deletedTransaction);

    return deletedTransaction;
  }
}

export default DeleteTransactionService;
