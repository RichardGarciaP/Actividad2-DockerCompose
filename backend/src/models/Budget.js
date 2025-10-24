import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: [
        'food',
        'transport',
        'housing',
        'utilities',
        'entertainment',
        'healthcare',
        'education',
        'shopping',
        'travel',
        'other_expense',
      ],
    },
    amount: {
      type: Number,
      required: [true, 'Please provide a budget amount'],
      min: 0,
    },
    spent: {
      type: Number,
      default: 0,
      min: 0,
    },
    period: {
      type: String,
      enum: ['weekly', 'monthly', 'yearly'],
      default: 'monthly',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    alertThreshold: {
      type: Number,
      default: 80,
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índice compuesto para búsquedas rápidas
budgetSchema.index({ user: 1, category: 1, startDate: 1 });

// Virtual para calcular el porcentaje gastado
budgetSchema.virtual('percentageSpent').get(function () {
  return (this.spent / this.amount) * 100;
});

// Virtual para saber si se excedió el presupuesto
budgetSchema.virtual('isExceeded').get(function () {
  return this.spent > this.amount;
});

// Virtual para saber si se alcanzó el umbral de alerta
budgetSchema.virtual('isAlertTriggered').get(function () {
  return (this.spent / this.amount) * 100 >= this.alertThreshold;
});

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
