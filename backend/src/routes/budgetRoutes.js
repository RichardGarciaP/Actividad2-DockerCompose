import express from 'express';
import {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetAlerts,
} from '../controllers/budgetController.js';
import { protect } from '../middlewares/auth.js';
import { body } from 'express-validator';

const router = express.Router();

// Validation middleware
const budgetValidation = [
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('amount')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('period')
    .optional()
    .isIn(['weekly', 'monthly', 'yearly'])
    .withMessage('Invalid period'),
];

router.use(protect);

router.route('/').get(getBudgets).post(budgetValidation, createBudget);

router.route('/alerts').get(getBudgetAlerts);

router
  .route('/:id')
  .get(getBudget)
  .put(updateBudget)
  .delete(deleteBudget);

export default router;
