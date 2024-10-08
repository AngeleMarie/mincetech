import express from 'express';
import storeController from '../../controllers/storeController/storeUsers.js';
import { body } from 'express-validator';
import validateRequest from '../../middleware/validateRequest.js';
import authenticateToken from '../../middleware/authMiddleware.js';

const router = express.Router();

// Add Card for User
router.post(
  '/addCard',
  authenticateToken,
  [
    body('uid').isString().notEmpty(),
    body('fullName').isString().notEmpty(),
    body('phoneNumber').isString().notEmpty(),
    body('branchName').isString().notEmpty(),
    body('email').isEmail(),
    body('storeName').isString().notEmpty(),
    body('cardNumber').isString().notEmpty(),
  ],
  validateRequest,
  storeController.addCardForUser
);

// Get All Cards
router.get('/getCards', authenticateToken, storeController.getAllCards);

// Update Card for User
router.put(
  '/updateCard/:cardId',
  authenticateToken,
  [
    body('fullName').optional().isString().notEmpty(),
    body('phoneNumber').optional().isString().notEmpty(),
    body('branchName').optional().isString().notEmpty(),
    body('uid').optional().isString().notEmpty(),
  ],
  validateRequest,
  storeController.updateCardForUser
);

// Delete Card for User
router.delete(
  '/deleteCard/:cardId',
  authenticateToken,
  storeController.deleteCardForUser
);

export default router;
