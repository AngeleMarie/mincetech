import  express from 'express';
import createReport from '../controllers/problemControllers/problemReportController.js';
import  validateReport from '../validators/problemReportValidator.js';

const router = express.Router();


router.post('/messageReport', validateReport, createReport);

export default router;
