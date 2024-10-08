import express from 'express';
import billingController from '../../controllers/storeController/storeBilling.js';
import upload from "../../config/multerConfig.js";
import { body } from 'express-validator';
import validateRequest from '../../middleware/validateRequest.js';
import authenticateToken from '../../middleware/authMiddleware.js';

const router = express.Router();

// Register Billing Data
router.post(
  '/register/:storeId',
  authenticateToken,
  upload.single('profilePicture'),
  [
    body('plan').isIn(['Basic', 'Premium', 'Free Trial']),
    body('balance').isNumeric(),
    body('currency').isString(),
  ],
  validateRequest,
  billingController.registerBillingData
);

router.get('/get/:storeId', authenticateToken, billingController.getBillingData);

// Update Billing Data
router.put(
  '/update/:storeId',
  authenticateToken,
  [
    body('plan').optional().isIn(['Basic', 'Premium', 'Free Trial']),
    body('balance').optional().isNumeric(),
    body('currency').optional().isString(),
  ],
  validateRequest,
  billingController.updateBillingData
);

// Delete Billing Data
router.delete('/delete/:storeId', authenticateToken, billingController.deleteBillingData);

export default router;
