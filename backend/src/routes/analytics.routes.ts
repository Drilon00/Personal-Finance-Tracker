import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate as any);

router.get('/overview', analyticsController.overview as any);
router.get('/monthly', analyticsController.monthly as any);
router.get('/categories', analyticsController.categoryBreakdown as any);
router.get('/trend', analyticsController.dailyTrend as any);

export default router;
