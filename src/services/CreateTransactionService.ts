// import AppError from '../errors/AppError';

import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  type: 'outcome' | 'income';
  category: string;
  value: number;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    category,
    value,
  }: Request): Promise<Transaction> {
    // TODO
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    const balance = await transactionRepository.getBalance();

    if (type === 'outcome' && balance.total < value) {
      throw new AppError('You do not have enough balance.');
    }

    let transactionCategory = await categoryRepository.findOne({
      title: category,
    });

    if (!transactionCategory) {
      const categoryCreate = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(categoryCreate);
      transactionCategory = categoryCreate;
    }

    const transaction = transactionRepository.create({
      title,
      type,
      category: transactionCategory,
      value,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
