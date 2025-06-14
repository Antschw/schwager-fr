import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/auth.middleware';
import { 
    startStream, 
    stopStream, 
    getStreamStatus,
    getStreamUrl 
} from '../controllers/streaming.controller';

const router = Router();

// POST /api/plants/streaming/start - Start webcam stream (protected)
router.post('/start', requireAuth, startStream);

// POST /api/plants/streaming/stop - Stop webcam stream (protected)
router.post('/stop', requireAuth, stopStream);

// GET /api/plants/streaming/status - Get stream status (protected)
router.get('/status', requireAuth, getStreamStatus);

// GET /api/plants/streaming/url - Get stream URL (protected)
router.get('/url', requireAuth, getStreamUrl);

export default router;