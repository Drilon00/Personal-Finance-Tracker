import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator';

const router = Router();

router.use(authenticate as any);

router.get('/', categoryController.list as any);
router.get('/:id', categoryController.getById as any);
router.post('/', validate(createCategorySchema), categoryController.create as any);
router.put('/:id', validate(updateCategorySchema), categoryController.update as any);
router.delete('/:id', categoryController.remove as any);

export default router;
