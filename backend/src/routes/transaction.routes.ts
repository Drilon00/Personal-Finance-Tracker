import { Router } from 'express';
import * as transactionController from '../controllers/transaction.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionFiltersSchema,
} from '../validators/transaction.validator';

const router = Router();

router.use(authenticate as any);

router.get('/', validate(transactionFiltersSchema, 'query'), transactionController.list as any);
router.get('/:id', transactionController.getById as any);
router.post('/', validate(createTransactionSchema), transactionController.create as any);
router.put('/:id', validate(updateTransactionSchema), transactionController.update as any);
router.delete('/:id', transactionController.remove as any);

export default router;
