import express from 'express';
import {getMeHandler, loginHandler, logoutHandler} from '../controllers/auth.controller';
import {updateUserProfileHandler, changePasswordHandler} from '../controllers/user.controller';
import validate from '../../shared/middleware/validate.middleware';
import {loginSchema} from '../schemas/auth.schema';
import {updateUserProfileSchema, changePasswordSchema} from '../schemas/user.schema';
import {requireAuth} from '../../shared/middleware/auth.middleware';

const router = express.Router();

// Login route
router.post('/login', validate(loginSchema), loginHandler);

// Logout route
router.post('/logout', requireAuth, logoutHandler);

// Get current user route
router.get('/me', requireAuth, getMeHandler);

// Update current user profile
router.patch('/me', requireAuth, validate(updateUserProfileSchema), updateUserProfileHandler);

// Change current user password
router.patch('/change-password', requireAuth, validate(changePasswordSchema), changePasswordHandler);

export default router;
