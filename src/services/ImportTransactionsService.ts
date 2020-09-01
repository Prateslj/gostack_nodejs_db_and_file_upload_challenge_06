import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { getCustomRepository, getRepository } from 'typeorm';

import Category from '../models/Category';
import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

import CreateTransactionService from './CreateTransactionService';

class ImportTransactionsService {
  public async execute({ filename }): Promise<Transaction[]> {
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const csvFilePath = path.join(uploadConfig.directory, filename);
    const transactionsArray = [];

    console.log('csvFilePath: ', csvFilePath);

    fs.createReadStream(csvFilePath)
      .pipe(csv({ skipLines: 1 }))
      .on('data', async row => {
        console.log('row: ', row);
        transactionsArray.push({ title, type, value, category });
      })
      .on('end', () => {
        console.log('Csv file successfully processed!');
      });
    console.log(transactionsArray);
    // const { title, type, value, category } = row;

    // let categoryItem = await categoriesRepository.findOne({
    //   where: { title: category },
    // });
    // if (!categoryItem) {
    //   categoryItem = categoriesRepository.create({
    //     title: category,
    //   });
    //   await categoriesRepository.save(categoryItem);
    // }

    // const transaction = transactionsRepository.create({
    //   title,
    //   value,
    //   type,
    //   category_id: categoryItem.id,
    // });

    // await transactionsRepository.save(transaction);
    // console.log(row);

    // return transactionsRepository;
    return transactionsArray;
  }
}

export default ImportTransactionsService;
