import fs from 'fs';
import path from 'path';
import csvparser from 'csv-parse';

import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

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
    const createTransaction = new CreateTransactionService();

    const parseConfig = csvparser({ ltrim: true, from_line: 2 });

    const dataStream = fs.createReadStream(csvFilePath);

    const parseCSV = dataStream.pipe(parseConfig);

    const importedTransactions: TransactionDTO[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line;

      if (!title || !type || !value) return;

      importedTransactions.push({ title, type, value, category });
    });

    await new Promise((resolve, reject) => {
      parseCSV.on('error', err => reject(err));
      parseCSV.on('end', resolve);
    });

    const storedTransaction: Transaction[] = [];

    for (const transaction of importedTransactions) {
      const newTransaciton = await createTransaction.execute({
        ...transaction,
      });

      storedTransaction.push(newTransaciton);
    }

    await fs.promises.unlink(csvFilePath);

    return storedTransaction;
  }
}

export default ImportTransactionsService;
