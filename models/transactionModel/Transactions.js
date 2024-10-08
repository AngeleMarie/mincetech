import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  adminId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  recipientAccount: {
    type: String,
    required: true,
  },
  amount: {
    type: Number, // in cents
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Declined', 'Completed'],
    default: 'Pending',
  },
  transactionDate: { 
    type: Date, 
    default: Date.now 
  },
  stripePaymentIntentId: {
    type: String,
    required: false,
  },
}, { timestamps: true });

export default mongoose.model('Transaction', TransactionSchema);
