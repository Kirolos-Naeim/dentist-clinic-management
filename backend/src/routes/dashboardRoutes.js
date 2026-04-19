import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getDashboard, getReports } from '../controllers/dashboardController.js';

const router = Router();

router.get('/', asyncHandler(getDashboard));
router.get('/reports', asyncHandler(getReports));

export default router;
