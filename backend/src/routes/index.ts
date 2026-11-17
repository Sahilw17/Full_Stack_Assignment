import { Router } from 'express';
import dealRoutes from './deal.routes';
import aiRoutes from './ai.routes';
import workflowRoutes from './workflow.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

router.use('/deals', dealRoutes);
router.use('/ai', aiRoutes);
router.use('/workflows', workflowRoutes);
router.use('/analytics', analyticsRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'DealPulse AI Backend API',
    version: '1.0.0',
  });
});

export default router;
