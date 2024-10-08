import express from 'express';
import bodyParser from 'body-parser';
import stripe from '../config/stripeConfig.js'; 

const router = express.Router();

// Webhook endpoint to handle Stripe events
router.post('/webhook', bodyParser.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event types
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
      // Add additional logic here (e.g., update database, notify user, etc.)
      break;
    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object;
      console.error(`Payment failed: ${failedIntent.last_payment_error.message}`);
      // Add additional logic here (e.g., notify user, log error, etc.)
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).end();
});

export default router;
