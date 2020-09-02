import { getCustomRepository, getRepository, In } from 'typeorm';
import fs from 'fs';
import path from 'path';
import csvparser from 'csv-parse';

import uploadConfig from '../config/upload';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
// import CreateTransactionService from './CreateTransactionService';
import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  filename: string;
}

interface TransactionDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  public async execute({ filename }: Request): Promise<Transaction[]> {
    const csvFilePath = path.join(uploadConfig.directory, filename);
    const transactionsRepository = getCustomRepository(TransactionRepository);
    const categoriesRepository = getRepository(Category);

    const parseConfig = csvparser({ ltrim: true, from_line: 2 });

    const dataStream = fs.createReadStream(csvFilePath);

    const parseCSV = dataStream.pipe(parseConfig);

    const importedTransactions: TransactionDTO[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line;

      if (!title || !type || !value) return;

      categories.push(category);

      importedTransactions.push({ title, type, value, category });
    });

    await new Promise((resolve, reject) => {
      parseCSV.on('error', err => reject(err));
      parseCSV.on('end', resolve);
    });

    const existentCategories = await categoriesRepository.find({
      where: { title: In(categories) },
    });

    const categoryTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    const categoriesToAdd = categories
      .filter(category => !categoryTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      categoriesToAdd.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existentCategories];

    const createdTransactions = transactionsRepository.create(
      importedTransactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(createdTransactions);

    await fs.promises.unlink(csvFilePath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
