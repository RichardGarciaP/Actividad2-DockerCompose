import express from 'express';
import {
  register,
  login,
  getMe,
  enable2FA,
  verify2FA,
  disable2FA,
} from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
import { body } from 'express-validator';

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.post('/enable-2fa', protect, enable2FA);
router.post('/verify-2fa', verify2FA);
router.post('/disable-2fa', protect, disable2FA);

export default router;
