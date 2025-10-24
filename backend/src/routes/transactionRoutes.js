import express from 'express';
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
} from '../controllers/transactionController.js';
import { protect } from '../middlewares/auth.js';
import { body } from 'express-validator';

const router = express.Router();

// Validation middleware
const transactionValidation = [
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Type must be income or expense'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('amount')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('bankAccount').notEmpty().withMessage('Bank account is required'),
];

router.use(protect);

router.route('/').get(getTransactions).post(transactionValidation, createTransaction);

router.route('/stats/summary').get(getTransactionStats);

router
  .route('/:id')
  .get(getTransaction)
  .put(updateTransaction)
  .delete(deleteTransaction);

export default router;
