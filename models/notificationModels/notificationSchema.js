
import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Authentication', required: true },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Sent'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Notification', NotificationSchema);
