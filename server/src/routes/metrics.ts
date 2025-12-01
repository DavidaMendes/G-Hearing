import express from 'express';
import { MetricsController } from '../controllers/index.js';
import { authenticateToken } from '../middlewares/index.js';

const router = express.Router();
const metricsController = new MetricsController();

router.get(
	'/mais-usados',
	authenticateToken,
	metricsController.getMostUsedMusics.bind(metricsController)
);

router.get(
	'/quantidade-trilhas-ultimo-mes',
	authenticateToken,
	metricsController.getTracksCountLastMonth.bind(metricsController)
);

export default router;

