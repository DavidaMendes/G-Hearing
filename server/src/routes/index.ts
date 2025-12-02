import express from 'express';
import userRoutes from './user.js';
import videoRoutes from './video.js';
import metricsRoutes from './metrics.js';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/videos', videoRoutes);
router.use('/metrics', metricsRoutes);

export default router;
