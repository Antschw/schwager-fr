import express from 'express';
import {createUserHandler, deleteUserHandler} from '../controllers/user.controller';
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

// Delete a user by ID (only accessible by ADMIN)
router.delete(
    '/:id',
    requireAuth,
    requireRole(Role.ADMIN),
    deleteUserHandler
);

export default router;
