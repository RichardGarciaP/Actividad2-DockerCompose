import BankAccount from '../models/BankAccount.js';
import { encrypt, decrypt } from '../utils/encryption.js';

// @desc    Get all bank accounts for logged in user
// @route   GET /api/accounts
// @access  Private
export const getAccounts = async (req, res, next) => {
  try {
    const accounts = await BankAccount.find({ user: req.user.id });

    res.status(200).json({
      success: true,
      count: accounts.length,
      data: accounts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single bank account
// @route   GET /api/accounts/:id
// @access  Private
export const getAccount = async (req, res, next) => {
  try {
    const account = await BankAccount.findById(req.params.id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found',
      });
    }

    // Make sure user is account owner
    if (account.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authorized',
      });
    }

    res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new bank account
// @route   POST /api/accounts
// @access  Private
export const createAccount = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    // Encrypt account number
    if (req.body.accountNumber) {
      try {
        req.body.accountNumber = encrypt(req.body.accountNumber);
      } catch (encryptError) {
        return res.status(500).json({
          success: false,
          message: 'Encryption error: Invalid encryption key configuration. Please contact administrator.',
        });
      }
    }

    const account = await BankAccount.create(req.body);

    res.status(201).json({
      success: true,
      data: account,
    });
  } catch (error) {
    if (error.code === 'ERR_CRYPTO_INVALID_KEYLEN') {
      return res.status(500).json({
        success: false,
        message: 'Server encryption configuration error. The encryption key must be exactly 32 characters.',
      });
    }
    next(error);
  }
};

// @desc    Update bank account
// @route   PUT /api/accounts/:id
// @access  Private
export const updateAccount = async (req, res, next) => {
  try {
    let account = await BankAccount.findById(req.params.id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found',
      });
    }

    // Make sure user is account owner
    if (account.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authorized',
      });
    }

    // Encrypt account number if being updated
    if (req.body.accountNumber) {
      req.body.accountNumber = encrypt(req.body.accountNumber);
    }

    account = await BankAccount.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete bank account
// @route   DELETE /api/accounts/:id
// @access  Private
export const deleteAccount = async (req, res, next) => {
  try {
    const account = await BankAccount.findById(req.params.id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found',
      });
    }

    // Make sure user is account owner
    if (account.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authorized',
      });
    }

    await account.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get total balance across all accounts
// @route   GET /api/accounts/stats/total-balance
// @access  Private
export const getTotalBalance = async (req, res, next) => {
  try {
    const accounts = await BankAccount.find({ user: req.user.id, isActive: true });

    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

    res.status(200).json({
      success: true,
      data: {
        totalBalance,
        accountCount: accounts.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
