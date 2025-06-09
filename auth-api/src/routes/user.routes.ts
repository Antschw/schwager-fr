import express from 'express';
import {createUserHandler} from '../controllers/user.controller';
import validate from '../middleware/validate.middleware';
import {createUserSchema} from '../schemas/user.schema';
import {requireAuth, requireRole} from '../middleware/auth.middleware';
import {Role} from '@prisma/client';

const router = express.Router();

// Create a new user (only accessible by ADMIN)
router.post(
    '/',
    requireAuth,
    requireRole(Role.ADMIN),
    validate(createUserSchema),
    createUserHandler
);

export default router;
