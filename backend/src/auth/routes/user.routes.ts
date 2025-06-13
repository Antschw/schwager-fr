import express from 'express';
import {createUserHandler, deleteUserHandler, getAllUsersHandler} from '../controllers/user.controller';
import validate from '../../shared/middleware/validate.middleware';
import {createUserSchema} from '../schemas/user.schema';
import {requireAuth, requireRole} from '../../shared/middleware/auth.middleware';
import {Role} from '@prisma/client';

const router = express.Router();

// Get all users (only accessible by ADMIN)
router.get(
    '/',
    requireAuth,
    requireRole(Role.ADMIN),
    getAllUsersHandler
);


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
