import { Router } from 'express';
import * as budgetController from '../controllers/budget.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createBudgetSchema, updateBudgetSchema } from '../validators/budget.validator';

const router = Router();
router.use(authenticate as any);

router.get('/', budgetController.list as any);
router.get('/summary', budgetController.summary as any);
router.post('/', validate(createBudgetSchema), budgetController.create as any);
router.put('/:id', validate(updateBudgetSchema), budgetController.update as any);
router.delete('/:id', budgetController.remove as any);

export default router;
