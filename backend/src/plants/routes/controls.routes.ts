import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/auth.middleware';
import { 
    triggerPump, 
    getDeviceStatus, 
    updateDeviceSettings 
} from '../controllers/controls.controller';

const router = Router();

// POST /api/plants/controls/pump - Trigger pump activation (protected)
router.post('/pump', requireAuth, triggerPump);

// GET /api/plants/controls/status - Get device status (protected)
router.get('/status', requireAuth, getDeviceStatus);

// PUT /api/plants/controls/settings - Update device settings (protected)
router.put('/settings', requireAuth, updateDeviceSettings);

export default router;