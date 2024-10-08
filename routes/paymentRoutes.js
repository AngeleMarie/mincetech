import express from 'express';
import injectIO from '../middleware/injectMiddleware.js';
import paymentController from '../controllers/paymentController/paymentController.js';
import authenticateToken from '../middleware/authMiddleware.js';
import { body } from 'express-validator';
import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();


router.post(
  '/create-payment',
  //authenticateToken,
  injectIO,
  [
    body('uid').isString().notEmpty(),
    body('storeId').isMongoId(),
    body('amount').isInt({ gt: 0 }),
  ],
  // validateRequest,
  paymentController.createPayment
);

// Confirm Payment Intent
router.post(
  '/confirm-payment',
  authenticateToken,
  injectIO,
  [
    body('transactionId').isMongoId(),
    body('paymentMethodId').isString().notEmpty(),
    body('action').isIn(['approve', 'decline']),
  ],
  validateRequest,
  paymentController.paymentIntentHandler
);

export default router;
