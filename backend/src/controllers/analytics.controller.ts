import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';

export class AnalyticsController {
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = analyticsService.getOverview();
      res.json({ status: 'success', data });
    } catch (err) {
      next(err);
    }
  }
}

export const analyticsController = new AnalyticsController();
