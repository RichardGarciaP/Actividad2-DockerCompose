import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';

// @desc    Get all budgets for logged in user
// @route   GET /api/budgets
// @access  Private
export const getBudgets = async (req, res, next) => {
  try {
    const { isActive, category } = req.query;

    const query = { user: req.user.id };

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (category) {
      query.category = category;
    }

    const budgets = await Budget.find(query).sort({ createdAt: -1 });

    // Calculate percentage spent and status for each budget
    const budgetsWithStatus = budgets.map((budget) => {
      const percentageSpent = (budget.spent / budget.amount) * 100;
      const remaining = budget.amount - budget.spent;

      return {
        ...budget.toObject(),
        percentageSpent: percentageSpent.toFixed(2),
        remaining,
        isExceeded: budget.spent > budget.amount,
        isAlertTriggered: percentageSpent >= budget.alertThreshold,
      };
    });

    res.status(200).json({
      success: true,
      count: budgetsWithStatus.length,
      data: budgetsWithStatus,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single budget
// @route   GET /api/budgets/:id
// @access  Private
export const getBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }

    // Make sure user is budget owner
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authorized',
      });
    }

    const percentageSpent = (budget.spent / budget.amount) * 100;
    const remaining = budget.amount - budget.spent;

    const budgetWithStatus = {
      ...budget.toObject(),
      percentageSpent: percentageSpent.toFixed(2),
      remaining,
      isExceeded: budget.spent > budget.amount,
      isAlertTriggered: percentageSpent >= budget.alertThreshold,
    };

    res.status(200).json({
      success: true,
      data: budgetWithStatus,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new budget
// @route   POST /api/budgets
// @access  Private
export const createBudget = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    // Calculate spent amount based on existing transactions
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const category = req.body.category;

    const transactions = await Transaction.find({
      user: req.user.id,
      type: 'expense',
      category: category,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const spent = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    req.body.spent = spent;

    const budget = await Budget.create(req.body);

    res.status(201).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
export const updateBudget = async (req, res, next) => {
  try {
    let budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }

    // Make sure user is budget owner
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authorized',
      });
    }

    budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
export const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }

    // Make sure user is budget owner
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authorized',
      });
    }

    await budget.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get budget alerts (exceeded or threshold reached)
// @route   GET /api/budgets/alerts
// @access  Private
export const getBudgetAlerts = async (req, res, next) => {
  try {
    const budgets = await Budget.find({
      user: req.user.id,
      isActive: true,
    });

    const alerts = budgets
      .filter((budget) => {
        const percentageSpent = (budget.spent / budget.amount) * 100;
        return (
          percentageSpent >= budget.alertThreshold || budget.spent > budget.amount
        );
      })
      .map((budget) => {
        const percentageSpent = (budget.spent / budget.amount) * 100;
        return {
          budgetId: budget._id,
          category: budget.category,
          amount: budget.amount,
          spent: budget.spent,
          percentageSpent: percentageSpent.toFixed(2),
          isExceeded: budget.spent > budget.amount,
          message:
            budget.spent > budget.amount
              ? `Budget exceeded for ${budget.category}`
              : `Budget alert: ${percentageSpent.toFixed(0)}% spent on ${budget.category}`,
        };
      });

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};
