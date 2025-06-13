import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/auth.middleware';
import { 
    postSensorData, 
    getSensorData, 
    getSensorHistory 
} from '../controllers/sensors.controller';

const router = Router();

// POST /api/plants/sensors/data - Receive sensor data from IoT devices
router.post('/data', postSensorData);

// GET /api/plants/sensors/data - Get current sensor readings (protected)
router.get('/data', requireAuth, getSensorData);

// GET /api/plants/sensors/history - Get sensor history (protected)
router.get('/history', requireAuth, getSensorHistory);

export default router;