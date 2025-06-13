import express from 'express';
import {getMeHandler, loginHandler, logoutHandler} from '../controllers/auth.controller';
import validate from '../../shared/middleware/validate.middleware';
import {loginSchema} from '../schemas/auth.schema';
import {requireAuth} from '../../shared/middleware/auth.middleware';

const router = express.Router();

// Login route
router.post('/login', validate(loginSchema), loginHandler);

// Logout route
router.post('/logout', requireAuth, logoutHandler);

// Get current user route
router.get('/me', requireAuth, getMeHandler);


export default router;
