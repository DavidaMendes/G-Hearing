import express from 'express';
import { VideoController } from '../controllers/index.js';
import { uploadVideo, authenticateToken, validate } from '../middlewares/index.js';
import { videoSchemas } from '../schemas/index.js';

const router = express.Router();
const videoController = new VideoController();

router.post(
	'/process',
	authenticateToken,
	uploadVideo,
	validate(videoSchemas.process),
	videoController.processVideo.bind(videoController)
);

router.post(
	'/:videoId/export',
	authenticateToken,
	videoController.exportVideo.bind(videoController)
);

router.get(
	'/',
	authenticateToken,
	videoController.listVideos.bind(videoController)
);

router.get(
	'/summary',
	authenticateToken,
	videoController.listVideosSummary.bind(videoController)
);

router.get(
	'/list',
	authenticateToken,
	videoController.listVideosSummary.bind(videoController)
);

router.get(
	'/:videoId/audios',
	authenticateToken,
	videoController.getAudiosByVideoId.bind(videoController)
);

router.delete(
	'/:videoId',
	authenticateToken,
	videoController.deleteVideo.bind(videoController)
);

export default router;
