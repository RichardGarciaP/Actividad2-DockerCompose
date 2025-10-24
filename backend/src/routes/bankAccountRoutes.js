import express from 'express';
import {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  getTotalBalance,
} from '../controllers/bankAccountController.js';
import { protect } from '../middlewares/auth.js';
import { body } from 'express-validator';

const router = express.Router();

// Validation middleware
const accountValidation = [
  body('accountName').trim().notEmpty().withMessage('Account name is required'),
  body('bankName').trim().notEmpty().withMessage('Bank name is required'),
  body('accountNumber').trim().notEmpty().withMessage('Account number is required'),
  body('accountType')
    .optional()
    .isIn(['checking', 'savings', 'credit', 'investment'])
    .withMessage('Invalid account type'),
];

router.use(protect);

router.route('/').get(getAccounts).post(accountValidation, createAccount);

router.route('/stats/total-balance').get(getTotalBalance);

router
  .route('/:id')
  .get(getAccount)
  .put(updateAccount)
  .delete(deleteAccount);

export default router;
