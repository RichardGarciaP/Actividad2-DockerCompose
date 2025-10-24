import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Plus,
  AlertCircle,
  X,
  DollarSign,
  Calendar,
  TrendingDown,
} from 'lucide-react';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    alertThreshold: 80,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const expenseCategories = [
    {
      value: 'food',
      label: 'Food',
      icon: '🍔',
      description: 'Groceries, restaurants, delivery',
    },
    {
      value: 'transport',
      label: 'Transport',
      icon: '🚗',
      description: 'Gas, public transit, parking',
    },
    {
      value: 'housing',
      label: 'Housing',
      icon: '🏠',
      description: 'Rent, mortgage, maintenance',
    },
    {
      value: 'utilities',
      label: 'Utilities',
      icon: '💡',
      description: 'Electric, water, internet',
    },
    {
      value: 'entertainment',
      label: 'Entertainment',
      icon: '🎮',
      description: 'Movies, games, hobbies',
    },
    {
      value: 'healthcare',
      label: 'Healthcare',
      icon: '⚕️',
      description: 'Medical, pharmacy, insurance',
    },
    {
      value: 'education',
      label: 'Education',
      icon: '📚',
      description: 'Tuition, books, courses',
    },
    {
      value: 'shopping',
      label: 'Shopping',
      icon: '🛍️',
      description: 'Clothes, electronics, gifts',
    },
    {
      value: 'travel',
      label: 'Travel',
      icon: '✈️',
      description: 'Flights, hotels, vacation',
    },
    {
      value: 'other_expense',
      label: 'Other',
      icon: '💸',
      description: 'Miscellaneous expenses',
    },
  ];

  useEffect(() => {
    fetchBudgets();
  }, []);

  useEffect(() => {
    if (formData.startDate && formData.period) {
      const start = new Date(formData.startDate);
      let end = new Date(start);

      switch (formData.period) {
        case 'weekly':
          end.setDate(end.getDate() + 7);
          break;
        case 'monthly':
          end.setMonth(end.getMonth() + 1);
          break;
        case 'yearly':
          end.setFullYear(end.getFullYear() + 1);
          break;
      }

      setFormData((prev) => ({
        ...prev,
        endDate: end.toISOString().split('T')[0],
      }));
    }
  }, [formData.startDate, formData.period]);

  const fetchBudgets = async () => {
    try {
      const response = await api.get('/budgets');
      setBudgets(response.data.data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.category) {
      setError('Please select a category');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid budget amount');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError('Please select valid dates');
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/budgets', {
        category: formData.category,
        amount: parseFloat(formData.amount),
        period: formData.period,
        startDate: formData.startDate,
        endDate: formData.endDate,
        alertThreshold: parseInt(formData.alertThreshold),
      });

      setFormData({
        category: '',
        amount: '',
        period: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        alertThreshold: 80,
      });

      setShowModal(false);
      fetchBudgets();
    } catch (err) {
      console.error('Error creating budget:', err);
      setError(err.response?.data?.message || 'Failed to create budget');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (budgetId) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }

    try {
      await api.delete(`/budgets/${budgetId}`);
      fetchBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Failed to delete budget');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getCategoryDisplay = (category) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-600';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-600';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Budgets
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track and manage your spending budgets by category
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Budget
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.length === 0 ? (
            <div className="col-span-full card text-center py-12">
              <TrendingDown className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No budgets found. Create your first budget to start tracking
                your expenses!
              </p>
            </div>
          ) : (
            budgets.map((budget) => (
              <div
                key={budget._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl border border-gray-200 dark:border-gray-700 p-6 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {getCategoryDisplay(budget.category)}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-1">
                      {budget.period} • {formatDate(budget.startDate)} -{' '}
                      {formatDate(budget.endDate)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {budget.isExceeded && (
                      <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                    )}
                    <button
                      onClick={() => handleDelete(budget._id)}
                      className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Spent
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(budget.spent)} /{' '}
                      {formatCurrency(budget.amount)}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${getProgressColor(
                        budget.percentageSpent
                      )}`}
                      style={{
                        width: `${Math.min(budget.percentageSpent, 100)}%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {budget.percentageSpent}% used
                    </span>
                    <span
                      className={`font-semibold ${
                        budget.remaining >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {formatCurrency(Math.abs(budget.remaining))}{' '}
                      {budget.remaining >= 0 ? 'left' : 'over'}
                    </span>
                  </div>
                </div>

                {budget.isAlertTriggered && !budget.isExceeded && (
                  <div className="mt-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-800 dark:text-yellow-300">
                    ⚠️ Warning: You've reached {budget.alertThreshold}% of your
                    budget
                  </div>
                )}

                {budget.isExceeded && (
                  <div className="mt-4 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-800 dark:text-red-300">
                    🚨 Budget exceeded! You've overspent by{' '}
                    {formatCurrency(Math.abs(budget.remaining))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create Budget
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded">
                  {error}
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  💡 <strong>Tip:</strong> Set a budget for each spending
                  category to track your expenses automatically. The system will
                  update your spending in real-time as you add transactions.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {expenseCategories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, category: cat.value })
                      }
                      className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center space-y-2 transition-colors hover:border-primary-300 dark:hover:border-primary-600 ${
                        formData.category === cat.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 dark:border-primary-400'
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
                      }`}
                    >
                      <span className="text-3xl">{cat.icon}</span>
                      <div className="text-center">
                        <span className="text-sm font-semibold block text-gray-900 dark:text-white">
                          {cat.label}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {cat.description}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Budget Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="input-field pl-10 text-lg font-semibold"
                    placeholder="500.00"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Maximum amount you want to spend in this category
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Budget Period
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'weekly', label: 'Weekly', duration: '7 days' },
                    { value: 'monthly', label: 'Monthly', duration: '30 days' },
                    { value: 'yearly', label: 'Yearly', duration: '365 days' },
                  ].map((period) => (
                    <button
                      key={period.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, period: period.value })
                      }
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        formData.period === period.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:border-primary-400 dark:text-primary-300'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700'
                      }`}
                    >
                      <div className="text-center">
                        <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                          {period.label}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {period.duration}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alert Threshold ({formData.alertThreshold}%)
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={formData.alertThreshold}
                  onChange={(e) =>
                    setFormData({ ...formData, alertThreshold: e.target.value })
                  }
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  You'll receive a warning when you reach{' '}
                  {formData.alertThreshold}% of your budget
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
