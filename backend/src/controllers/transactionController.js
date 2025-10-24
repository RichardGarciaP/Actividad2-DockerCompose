import Transaction from '../models/Transaction.js';
import BankAccount from '../models/BankAccount.js';
import Budget from '../models/Budget.js';

// @desc    Get all transactions for logged in user
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, limit = 50, page = 1 } = req.query;

    const query = { user: req.user.id };

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate('bankAccount', 'accountName bankName')
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
export const getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate(
      'bankAccount',
      'accountName bankName'
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    // Make sure user is transaction owner
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authorized',
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    // Verify bank account belongs to user
    const bankAccount = await BankAccount.findById(req.body.bankAccount);

    if (!bankAccount) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found',
      });
    }

    if (bankAccount.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authorized',
      });
    }

    const transaction = await Transaction.create(req.body);

    // Update bank account balance
    if (transaction.type === 'income') {
      bankAccount.balance += transaction.amount;
    } else {
      bankAccount.balance -= transaction.amount;
    }
    await bankAccount.save();

    // Update budget spent if transaction is expense
    if (transaction.type === 'expense') {
      const budget = await Budget.findOne({
        user: req.user.id,
        category: transaction.category,
        isActive: true,
        startDate: { $lte: transaction.date },
        endDate: { $gte: transaction.date },
      });

      if (budget) {
        budget.spent += transaction.amount;
        await budget.save();
      }
    }

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = async (req, res, next) => {
  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    // Make sure user is transaction owner
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authorized',
      });
    }

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    // Make sure user is transaction owner
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authorized',
      });
    }

    // Update bank account balance
    const bankAccount = await BankAccount.findById(transaction.bankAccount);
    if (bankAccount) {
      if (transaction.type === 'income') {
        bankAccount.balance -= transaction.amount;
      } else {
        bankAccount.balance += transaction.amount;
      }
      await bankAccount.save();
    }

    await transaction.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats/summary
// @access  Private
export const getTransactionStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = { user: req.user.id };

    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    // Total income
    const incomeResult = await Transaction.aggregate([
      { $match: { ...dateFilter, type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Total expenses
    const expenseResult = await Transaction.aggregate([
      { $match: { ...dateFilter, type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Expenses by category
    const expensesByCategory = await Transaction.aggregate([
      { $match: { ...dateFilter, type: 'expense' } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Income by category
    const incomeByCategory = await Transaction.aggregate([
      { $match: { ...dateFilter, type: 'income' } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const totalIncome = incomeResult[0]?.total || 0;
    const totalExpenses = expenseResult[0]?.total || 0;
    const balance = totalIncome - totalExpenses;

    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        balance,
        expensesByCategory,
        incomeByCategory,
      },
    });
  } catch (error) {
    next(error);
  }
};
