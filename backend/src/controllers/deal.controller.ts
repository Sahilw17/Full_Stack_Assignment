import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { dealService } from '../services/deal.service';

export const createDealSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    company: z.string().min(2, 'Company must be at least 2 characters'),
    contact_name: z.string().min(2, 'Contact name is required'),
    contact_email: z.string().email('Invalid email address'),
    value: z.number().positive('Value must be greater than 0'),
    stage: z.enum(['LEAD', 'DISCOVERY', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    close_date: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

export const updateStageSchema = z.object({
  body: z.object({
    stage: z.enum(['LEAD', 'DISCOVERY', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']),
  }),
});

export class DealController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { stage, priority, search } = req.query;
      const deals = dealService.getAllDeals({
        stage: stage as string,
        priority: priority as string,
        search: search as string,
      });
      res.json({ status: 'success', data: deals });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const deal = dealService.getDealById(id);
      if (!deal) {
        return res.status(404).json({ status: 'error', message: 'Deal not found' });
      }
      res.json({ status: 'success', data: deal });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await dealService.createDeal(req.body);
      res.status(201).json({ status: 'success', data: result.deal, triggeredActions: result.triggeredActions });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updated = await dealService.updateDeal(id, req.body);
      if (!updated) {
        return res.status(404).json({ status: 'error', message: 'Deal not found' });
      }
      res.json({ status: 'success', data: updated });
    } catch (err) {
      next(err);
    }
  }

  async changeStage(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { stage } = req.body;
      const result = await dealService.changeStage(id, stage);
      if (!result) {
        return res.status(404).json({ status: 'error', message: 'Deal not found' });
      }
      res.json({ status: 'success', data: result.deal, triggeredActions: result.triggeredActions });
    } catch (err) {
      next(err);
    }
  }

  async refreshAi(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updated = await dealService.triggerAiRefresh(id);
      if (!updated) {
        return res.status(404).json({ status: 'error', message: 'Deal not found' });
      }
      res.json({ status: 'success', data: updated });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const success = dealService.deleteDeal(id);
      if (!success) {
        return res.status(404).json({ status: 'error', message: 'Deal not found' });
      }
      res.json({ status: 'success', message: 'Deal deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export const dealController = new DealController();
