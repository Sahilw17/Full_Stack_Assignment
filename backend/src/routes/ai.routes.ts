import { Router } from 'express';
import { aiController, generateEmailSchema, copilotSchema } from '../controllers/ai.controller';
import { validate } from '../middleware/validate.middleware';

const router = Router();

router.post('/generate-email', validate(generateEmailSchema), (req, res, next) =>
  aiController.generateEmail(req, res, next)
);

router.post('/copilot', validate(copilotSchema), (req, res, next) =>
  aiController.copilotChat(req, res, next)
);

export default router;
