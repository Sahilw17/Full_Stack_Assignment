import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { workflowRepository } from '../repositories/workflow.repository';

export const createWorkflowRuleSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Rule name must be at least 3 characters'),
    trigger_event: z.enum(['STAGE_CHANGED', 'SCORE_THRESHOLD', 'DEAL_CREATED', 'INACTIVITY']),
    condition_json: z.string(),
    action_type: z.enum(['SET_PRIORITY', 'AUTO_AI_BRIEF', 'SEND_NOTIFICATION', 'LOG_AUDIT']),
    action_payload: z.string(),
  }),
});

export class WorkflowController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const rules = workflowRepository.findAll();
      res.json({ status: 'success', data: rules });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, trigger_event, condition_json, action_type, action_payload } = req.body;
      const rule = workflowRepository.create({
        id: uuidv4(),
        name,
        trigger_event,
        condition_json,
        action_type,
        action_payload,
        is_active: 1,
        execution_count: 0,
        created_at: new Date().toISOString(),
      });
      res.status(201).json({ status: 'success', data: rule });
    } catch (err) {
      next(err);
    }
  }

  async toggleActive(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { isActive } = req.body;
      const success = workflowRepository.toggleActive(id, !!isActive);
      if (!success) {
        return res.status(404).json({ status: 'error', message: 'Rule not found' });
      }
      res.json({ status: 'success', message: 'Rule status updated' });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const success = workflowRepository.delete(id);
      if (!success) {
        return res.status(404).json({ status: 'error', message: 'Rule not found' });
      }
      res.json({ status: 'success', message: 'Rule deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export const workflowController = new WorkflowController();
