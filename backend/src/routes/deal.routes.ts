import { Router } from 'express';
import { dealController, createDealSchema, updateStageSchema } from '../controllers/deal.controller';
import { validate } from '../middleware/validate.middleware';

const router = Router();

router.get('/', (req, res, next) => dealController.getAll(req, res, next));
router.get('/:id', (req, res, next) => dealController.getById(req, res, next));
router.post('/', validate(createDealSchema), (req, res, next) => dealController.create(req, res, next));
router.put('/:id', (req, res, next) => dealController.update(req, res, next));
router.patch('/:id/stage', validate(updateStageSchema), (req, res, next) => dealController.changeStage(req, res, next));
router.post('/:id/ai-refresh', (req, res, next) => dealController.refreshAi(req, res, next));
router.delete('/:id', (req, res, next) => dealController.delete(req, res, next));

export default router;
