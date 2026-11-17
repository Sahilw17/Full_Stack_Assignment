import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { aiService } from '../services/ai.service';
import { dealRepository } from '../repositories/deal.repository';
import { activityRepository } from '../repositories/activity.repository';
import { v4 as uuidv4 } from 'uuid';

export const generateEmailSchema = z.object({
  body: z.object({
    dealId: z.string().min(1, 'Deal ID is required'),
    type: z.enum(['PITCH', 'FOLLOW_UP', 'OBJECTION', 'CLOSING']),
  }),
});

export const copilotSchema = z.object({
  body: z.object({
    query: z.string().min(1, 'Query cannot be empty'),
  }),
});

export class AiController {
  async generateEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { dealId, type } = req.body;
      const deal = dealRepository.findById(dealId);
      if (!deal) {
        return res.status(404).json({ status: 'error', message: 'Deal not found' });
      }

      const email = await aiService.generateEmail(deal, type);

      // Record activity
      activityRepository.create({
        id: uuidv4(),
        deal_id: dealId,
        type: 'EMAIL_GENERATED',
        description: `Generated ${type} sales email via AI Copilot`,
        metadata: JSON.stringify({ subject: email.subject, tone: email.tone }),
        created_at: new Date().toISOString(),
      });

      res.json({ status: 'success', data: email });
    } catch (err) {
      next(err);
    }
  }

  async copilotChat(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req.body;
      const deals = dealRepository.findAll();
      const reply = await aiService.askCopilot(query, deals);
      res.json({ status: 'success', reply });
    } catch (err) {
      next(err);
    }
  }
}

export const aiController = new AiController();
