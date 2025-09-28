import express from 'express';
import userRoutes from './user.js';
import videoRoutes from './video.js';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/videos', videoRoutes);

export default router;
