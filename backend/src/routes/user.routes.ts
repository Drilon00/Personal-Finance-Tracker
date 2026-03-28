import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateProfileSchema, changePasswordSchema } from '../validators/user.validator';

const router = Router();
router.use(authenticate as any);

router.put('/profile', validate(updateProfileSchema), userController.updateProfile as any);
router.put('/password', validate(changePasswordSchema), userController.changePassword as any);
router.delete('/account', userController.deleteAccount as any);

export default router;
