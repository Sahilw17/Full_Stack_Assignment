import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';

const router = Router();

router.get('/overview', (req, res, next) => analyticsController.getOverview(req, res, next));

export default router;
