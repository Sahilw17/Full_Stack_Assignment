import { Router } from 'express';
import { workflowController, createWorkflowRuleSchema } from '../controllers/workflow.controller';
import { validate } from '../middleware/validate.middleware';

const router = Router();

router.get('/', (req, res, next) => workflowController.getAll(req, res, next));
router.post('/', validate(createWorkflowRuleSchema), (req, res, next) =>
  workflowController.create(req, res, next)
);
router.patch('/:id/toggle', (req, res, next) =>
  workflowController.toggleActive(req, res, next)
);
router.delete('/:id', (req, res, next) =>
  workflowController.delete(req, res, next)
);

export default router;
