import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Plus,
  CreditCard,
  Trash2,
  X,
  Building,
  Wallet,
  DollarSign,
  Hash,
  TrendingUp,
} from 'lucide-react';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    accountName: '',
    bankName: '',
    accountNumber: '',
    accountType: 'checking',
    balance: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const accountTypes = [
    {
      value: 'checking',
      label: 'Checking',
      icon: '💳',
      color: 'blue',
      bgClass: 'bg-blue-500',
      darkBgClass: 'dark:bg-blue-600',
    },
    {
      value: 'savings',
      label: 'Savings',
      icon: '💰',
      color: 'green',
      bgClass: 'bg-green-500',
      darkBgClass: 'dark:bg-green-600',
    },
    {
      value: 'credit',
      label: 'Credit Card',
      icon: '💎',
      color: 'purple',
      bgClass: 'bg-purple-500',
      darkBgClass: 'dark:bg-purple-600',
    },
    {
      value: 'investment',
      label: 'Investment',
      icon: '📈',
      color: 'yellow',
      bgClass: 'bg-yellow-500',
      darkBgClass: 'dark:bg-yellow-600',
    },
  ];

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/accounts');
      setAccounts(response.data.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.accountName.trim()) {
      setError('Please enter an account name');
      return;
    }

    if (!formData.bankName.trim()) {
      setError('Please enter a bank name');
      return;
    }

    if (!formData.accountNumber.trim()) {
      setError('Please enter an account number');
      return;
    }

    if (!formData.balance || parseFloat(formData.balance) < 0) {
      setError('Please enter a valid balance');
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/accounts', {
        accountName: formData.accountName.trim(),
        bankName: formData.bankName.trim(),
        accountNumber: formData.accountNumber.trim(),
        accountType: formData.accountType,
        balance: parseFloat(formData.balance),
      });

      setFormData({
        accountName: '',
        bankName: '',
        accountNumber: '',
        accountType: 'checking',
        balance: '',
      });

      setShowModal(false);
      fetchAccounts();
    } catch (err) {
      console.error('Error creating account:', err);
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (accountId) => {
    if (!window.confirm('Are you sure you want to delete this account?')) {
      return;
    }

    try {
      await api.delete(`/accounts/${accountId}`);
      fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getAccountTypeInfo = (type) => {
    return accountTypes.find((t) => t.value === type) || accountTypes[0];
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Accounts
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your connected bank accounts
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center whitespace-nowrap"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Account
        </button>
      </div>

      <div className="bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-900 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary-100 dark:text-primary-200">
              Total Balance
            </p>
            <p className="text-4xl font-bold mt-2">
              {formatCurrency(totalBalance)}
            </p>
            <p className="text-sm text-primary-200 dark:text-primary-300 mt-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="hidden sm:block">
            <Wallet className="h-20 w-20 text-primary-300 dark:text-primary-400 opacity-50" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-center py-16 transition-colors">
              <Wallet className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No accounts yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                Add your first bank account to start tracking your finances
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary"
              >
                <Plus className="h-5 w-5 mr-2 inline" />
                Add Your First Account
              </button>
            </div>
          ) : (
            accounts.map((account) => {
              const typeInfo = getAccountTypeInfo(account.accountType);
              return (
                <div
                  key={account._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl border border-gray-200 dark:border-gray-700 p-6 transition-all"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`${typeInfo.bgClass} ${typeInfo.darkBgClass} p-3 rounded-xl`}
                      >
                        <span className="text-2xl">{typeInfo.icon}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {account.accountName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {account.bankName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Balance
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(account.balance)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          account.isActive
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {account.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 capitalize">
                        {typeInfo.label}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(account._id)}
                      className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete account"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Add Bank Account
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {accountTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, accountType: type.value })
                      }
                      className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center space-y-2 transition-all ${
                        formData.accountType === type.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-md'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700'
                      }`}
                    >
                      <span className="text-3xl">{type.icon}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Wallet className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.accountName}
                    onChange={(e) =>
                      setFormData({ ...formData, accountName: e.target.value })
                    }
                    className="input-field pl-10"
                    placeholder="My Main Account"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bank Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.bankName}
                    onChange={(e) =>
                      setFormData({ ...formData, bankName: e.target.value })
                    }
                    className="input-field pl-10"
                    placeholder="Banco del Pacifico"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.accountNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountNumber: e.target.value,
                      })
                    }
                    className="input-field pl-10"
                    placeholder="****1234"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  🔒 Your account number will be encrypted
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Initial Balance
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.balance}
                    onChange={(e) =>
                      setFormData({ ...formData, balance: e.target.value })
                    }
                    className="input-field pl-10 text-lg font-semibold"
                    placeholder="0.00"
                  />
                </div>
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
                  {submitting ? 'Adding...' : 'Add Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
