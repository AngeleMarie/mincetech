import express from 'express';
import dashboardController from "../../controllers/storeController/dashboardController.js"
import authenticateToken from '../../middleware/authMiddleware.js';

const router = express.Router();

// Get Store Overview
router.get('/getStoreInfo/:storeId', authenticateToken, dashboardController.getStoreOverview);

export default router;
