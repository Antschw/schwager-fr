import { Router } from 'express';
import sensorsRouter from './sensors.routes';
import photosRouter from './photos.routes';
import streamingRouter from './streaming.routes';
import controlsRouter from './controls.routes';

const router = Router();

router.use('/sensors', sensorsRouter);
router.use('/photos', photosRouter);
router.use('/streaming', streamingRouter);
router.use('/controls', controlsRouter);

export default router;