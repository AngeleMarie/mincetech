import Stripe from "stripe";
import dotenv from 'dotenv';
import Authentication from "../../models/userModels/AuthInfoSchema.js";
import Transaction from "../../models/TransactionSchema.js"
import StoreInfo from "../../models/storeModels/OtherSchema.js";
import Card from "../../models/cardSchema/cardSchema.js";
import notifyUser from "../notificationController/notificationController.js";
import admin from '../../config/firebase.js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create a new payment
const createPayment = async (req, res) => {
  const { uid, storeId, amount,branchName,payer } = req.body;

  if (!uid || !storeId || !amount) {
    return res.status(400).json({ error: 'UID, Store ID, and amount are required' });
  }

  try {
    // Find the card associated with the UID
    const card = await Card.findOne({ uid });
    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    const userId = card.userId;
    const user = await Authentication.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const transactionWith = `${user.firstname} ${user.lastname}`;

    // Find the store by ID
    const store = await StoreInfo.findById(storeId);
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    // Create a Payment Intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), 
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: { userId: userId.toString(), storeId: storeId.toString(), uid },
    });

    // Create a new transaction
    const transaction = new Transaction({
      userId,
      branchName,
      payer,
      storeId,
      amount,
      transactionWith,
      status: "Pending",
      paymentIntentId: paymentIntent.id,
    });
    await transaction.save();

    // Notify the user via Firebase Cloud Messaging (FCM)
    if (user.fcmToken) {
      const message = {
        notification: {
          title: "Transaction Request",
          body: `A payment of $${amount} is pending. Please accept or decline the payment.`,
        },
        token: user.fcmToken,
        data: {
          transactionId: transaction._id.toString(),
          amount: amount.toString(),
        },
      };

      admin.messaging().send(message)
        .then((response) => {
          console.log("FCM Notification sent successfully:", response);
        })
        .catch((error) => {
          console.error("Error sending FCM notification:", error);
        });
    } else {
      console.log("User does not have an FCM token.");
    }

    res.json({
      clientSecret: paymentIntent.client_secret,
      transactionId: transaction._id,
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    res.status(500).send({ error: error.message });
  }
};

// Confirm or decline a payment intent
const paymentIntentHandler = async (req, res) => {
  const { transactionId, paymentMethodId, action } = req.body;

  // Input validation
  if (!transactionId || !paymentMethodId || !action) {
    return res.status(400).json({ error: "Transaction ID, Payment Method ID, and action are required" });
  }

  try {
    // Find the transaction by ID
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    if (action === "decline") {
      // Decline the transaction
      transaction.status = "Declined";
      await transaction.save();

      // Notify the user about the decline
      await notifyUser(transaction.userId, {
        transactionId: transaction._id,
        message: `You have declined the payment of $${transaction.amount}.`,
      });

      return res.json({ message: "Payment declined" });
    }

    // Confirm the payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.confirm(
      transaction.paymentIntentId,
      {
        payment_method: paymentMethodId,
      }
    );

    if (paymentIntent.status === "succeeded") {
      // Update transaction status to Completed
      transaction.status = "Completed";
      await transaction.save();

      // Update user card balance
      const userCard = await Card.findOne({ userId: transaction.userId });
      if (!userCard || userCard.balance < transaction.amount) {
        return res.status(400).json({ error: "Insufficient card balance" });
      }

      userCard.balance -= transaction.amount;
      await userCard.save();

      // Update store balance
      const store = await StoreInfo.findById(transaction.storeId);
      store.balance += transaction.amount;
      await store.save();

      // Notify the user about the successful payment
      await notifyUser(transaction.userId, {
        transactionId: transaction._id,
        message: `Your payment of $${transaction.amount} was successful.`,
      });

      return res.json({ message: "Payment confirmed and balances updated" });
    } else {
      return res.status(400).json({ error: "Payment not successful" });
    }
  } catch (error) {
    console.error("Payment confirmation error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Approve a pending transaction
const approveTransaction = async (req, res) => {
  const { transactionId } = req.body;
  const userId = req.user.id; // Ensure user is authenticated

  try {
    // Find the transaction by ID
    const transaction = await Transaction.findById(transactionId);
    if (!transaction || transaction.status !== "Pending") {
      return res.status(404).json({
        success: false,
        message: "Transaction not found or already processed",
      });
    }

    // Find all transactions
    const all_transaction = await Transaction.findAll(transactionId);
    if (!all_transaction || all_transaction.status !== "Pending") {
      return res.status(404).json({
        success: false,
        message: "No transaction found",
      });
    }

    // Verify ownership
    if (transaction.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to approve this transaction",
      });
    }

    // Find the user and admin details
    const user = await Authentication.findById(userId);
    const admin = await Authentication.findById(transaction.adminId); // Assuming adminId is part of Transaction
    if (!user || !admin) {
      return res.status(404).json({ success: false, message: "User or Admin not found" });
    }

    // Create a Payment Intent with Stripe for approval
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(transaction.amount * 100), // Convert to cents
      currency: "usd",
      customer: user.stripeCustomerId,
      payment_method: user.defaultPaymentMethod,
      transfer_data: {
        destination: admin.stripeAccountId, // Ensure admin has a connected Stripe account
      },
      off_session: true,
      confirm: true,
      metadata: { transactionId: transactionId.toString() },
    });

    // Update transaction status to Approved
    transaction.status = "Approved";
    transaction.stripePaymentIntentId = paymentIntent.id;
    await transaction.save();

    // Notify Admin and User via Socket.IO or other real-time methods
    // Assuming you have an activeUsers mapping and Socket.IO initialized
    if (activeUsers[admin._id.toString()]) {
      io.to(activeUsers[admin._id.toString()]).emit("transactionCompleted", {
        transactionId: transaction._id,
        status: "Approved",
        paymentIntentId: paymentIntent.id,
      });
      console.log(`Emitted 'transactionCompleted' to admin ${admin._id}`);
    }

    if (activeUsers[userId]) {
      io.to(activeUsers[userId]).emit("transactionCompleted", {
        transactionId: transaction._id,
        status: "Approved",
        paymentIntentId: paymentIntent.id,
      });
      console.log(`Emitted 'transactionCompleted' to user ${userId}`);
    }

    res.status(200).json({
      success: true,
      message: "Transaction approved and processed",
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Error approving transaction:", error);
    if (error.code === "authentication_required") {
      res.status(400).json({
        success: false,
        message: "Authentication required for this transaction",
      });
    } else if (error.code === "payment_intent_requires_action") {
      // Handle additional authentication steps if required
      res.status(400).json({
        success: false,
        message: "Additional authentication required",
        requiresAction: true,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to process transaction",
        error: error.message,
      });
    }
  }
};

// Handle Stripe Webhooks
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent ${paymentIntent.id} was successful!`);
      
      // Update transaction status if necessary
      const transaction = await Transaction.findOne({ paymentIntentId: paymentIntent.id });
      if (transaction) {
        transaction.status = "Completed";
        await transaction.save();

        // Notify user and admin
        await notifyUser(transaction.userId, {
          transactionId: transaction._id,
          message: `Your payment of $${transaction.amount} was successful.`,
        });

        // Optionally notify admin
        if (activeUsers[transaction.adminId.toString()]) {
          io.to(activeUsers[transaction.adminId.toString()]).emit("transactionCompleted", {
            transactionId: transaction._id,
            status: "Completed",
            paymentIntentId: paymentIntent.id,
          });
          console.log(`Emitted 'transactionCompleted' to admin ${transaction.adminId}`);
        }
      }
      break;

    case 'payment_intent.payment_failed':
      const paymentFailedIntent = event.data.object;
      console.log(`PaymentIntent ${paymentFailedIntent.id} failed.`);

      // Update transaction status
      const failedTransaction = await Transaction.findOne({ paymentIntentId: paymentFailedIntent.id });
      if (failedTransaction) {
        failedTransaction.status = "Declined";
        await failedTransaction.save();

        // Notify user and admin
        await notifyUser(failedTransaction.userId, {
          transactionId: failedTransaction._id,
          message: `Your payment of $${failedTransaction.amount} has failed.`,
        });

        if (activeUsers[failedTransaction.adminId.toString()]) {
          io.to(activeUsers[failedTransaction.adminId.toString()]).emit("transactionFailed", {
            transactionId: failedTransaction._id,
            status: "Declined",
            paymentIntentId: paymentFailedIntent.id,
          });
          console.log(`Emitted 'transactionFailed' to admin ${failedTransaction.adminId}`);
        }
      }
      break;

    // Handle other event types as needed
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
};

export default { createPayment, paymentIntentHandler, approveTransaction, handleStripeWebhook };
