import multer from 'multer';
import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import uploadConfig from '../config/upload';
// import GetBalanceService from '../services/GetBalanceService';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const upload = multer(uploadConfig);
const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionsRepository.find();
  const balance = await transactionsRepository.getBalance();

  return response.json({ transactions, balance });

  // const getBalance = new GetBalanceService();

  // const balance = await getBalance.execute();

  // return response.json(balance);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute(id);

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('csvFile'),
  async (request, response) => {
    const importTransaction = new ImportTransactionsService();

    const importedTransaction = await importTransaction.execute({
      filename: request.file.filename,
    });

    return response.json(importedTransaction);
  },
);

export default transactionsRouter;
