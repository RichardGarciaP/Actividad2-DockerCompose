import mongoose from 'mongoose';

const bankAccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    accountName: {
      type: String,
      required: [true, 'Please provide an account name'],
      trim: true,
    },
    bankName: {
      type: String,
      required: [true, 'Please provide a bank name'],
      trim: true,
    },
    accountNumber: {
      type: String,
      required: [true, 'Please provide an account number'],
      trim: true,
    },
    accountType: {
      type: String,
      enum: ['checking', 'savings', 'credit', 'investment'],
      default: 'checking',
    },
    balance: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastSynced: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const BankAccount = mongoose.model('BankAccount', bankAccountSchema);

export default BankAccount;
