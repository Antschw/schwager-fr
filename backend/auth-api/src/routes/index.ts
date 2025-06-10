import express from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';

const router = express.Router();

// Health check route
router.get('/healthcheck', (_, res) => res.sendStatus(200));

// Mount application routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;
