import express from 'express';
import storeController from '../../controllers/storeController/auth.js';
import { body } from 'express-validator';
import validateRequest from '../../middleware/validateRequest.js';
import authenticateToken from '../../middleware/authMiddleware.js';

const router = express.Router();

// Store Registration
router.post(
  '/register',
  [
    body('storeName').isString().notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 8 })
      .matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])/),
    body('country').isString().notEmpty(),
    body('city').isString().notEmpty(),
    body('postalCode').isString().notEmpty(),
    body('role').optional().isIn(['Sub Admin', 'Manager']),
  ],
  validateRequest,
  storeController.registerStore
);

router.get('/confirm/:token', storeController.confirmEmail);

// Store login
router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').isString().notEmpty(),
    body('secretKey').isString().notEmpty(),
  ],
  validateRequest,
  storeController.loginStore
);

export default router;
