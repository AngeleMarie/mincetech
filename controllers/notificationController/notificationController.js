import { io, activeUsers } from '../../index.js';
import Notification from '../../models/notificationModels/notificationSchema.js';
import admin from '../../config/firebase.js';

const notifyUser = async (userId, notification) => {
  try {
    const userSocketId = activeUsers[userId];  // Get the user's active socket ID

    if (userSocketId) {
      // User is connected, send the notification via WebSocket
      io.to(userSocketId).emit('payment-notification', notification);
      console.log(`Notified user ${userId}:`, notification);
    } else {
      // User is not connected, store the notification for later delivery
      console.log(`User ${userId} is not connected. Notification stored.`);
      const newNotification = new Notification({
        userId,
        transactionId: notification.transactionId,
        message: notification.message,
        isRead: false, 
        status: 'Pending', 
        createdAt: new Date(),
      });
      await newNotification.save();
    }
  } catch (error) {
    console.error('Error notifying user:', error);
  }
};

// Retry sending notifications to users who have come back online
const retrySendingNotifications = async () => {
  try {
    // Fetch all pending notifications
    const pendingNotifications = await Notification.find({ status: 'Pending' });

    for (const notification of pendingNotifications) {
      const userSocketId = activeUsers[notification.userId];  // Check if the user is connected

      if (userSocketId) {
        // If user is connected, send the notification via WebSocket
        io.to(userSocketId).emit('payment-notification', {
          transactionId: notification.transactionId,
          message: notification.message,
        });

        console.log(`Retried and sent notification to user ${notification.userId}:`, notification.message);

        // Update notification status to 'Sent'
        notification.status = 'Sent';
        notification.isRead = true; 
        await notification.save();
      } else {
        console.log(`User ${notification.userId} is still not connected. Retry later.`);
      }
    }
  } catch (error) {
    console.error('Error retrying notifications:', error);
  }
};

// Schedule retry mechanism (e.g., every 10 minutes)
setInterval(retrySendingNotifications, 10 * 60 * 1000);

export default notifyUser;
