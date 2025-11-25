import type { Request, Response } from 'express';
import { VideoService } from '../services/index.js';

interface AuthRequest extends Request {
	userId?: number;
}

const videoService = new VideoService();

export default class VideoController {
	async processVideo(req: AuthRequest, res: Response) {
		try {
			if (!req.file) {
				return res.status(400).json({
					error: 'Arquivo não encontrado',
					message: 'Nenhum arquivo de vídeo foi enviado'
				});
			}

			if (!req.userId) {
				return res.status(401).json({
					error: 'Usuário não autenticado',
					message: 'Token de autenticação inválido'
				});
			}

			const { title } = req.body;
			const videoPath = req.file.path;
			const userId = req.userId;

			const result = await videoService.processVideo(videoPath, title, userId);

			if (result.success) {
				res.json({
					message: result.message,
					segments: result.segments,
					recognizedSongs: result.recognizedSongs,
					segmentsCount: result.segments.length,
					songsCount: result.recognizedSongs.length,
					videoPath: result.videoPath
				});
			} else {
				res.status(500).json({
					error: 'Erro no processamento',
					message: result.message
				});
			}
		} catch (error) {
			console.error('Erro no controller de vídeo:', error);
			res.status(500).json({
				error: 'Erro interno do servidor',
				message: 'Não foi possível processar o vídeo'
			});
		}
	}

	async getAudiosByVideoId(req: AuthRequest, res: Response) {
		try {
			const { videoId } = req.params;
			const result = await videoService.getAudiosByVideoId(Number(videoId));
			res.json(result);
		} catch (error) {
			console.error('Erro no controller de vídeo:', error);
		}
	}

	async exportVideo(req: AuthRequest, res: Response) {
		try {
			if (!req.userId) {
				return res.status(401).json({
					error: 'Usuário não autenticado',
					message: 'Token de autenticação inválido'
				});
			}

			const { videoId } = req.params;

			const result = await videoService.exportVideo(Number(videoId));

			if (result?.success) {
				res.json({
					message: result.message,
					edlPath: result.edlPath
				});
			} else {
				res.status(500).json({
					error: 'Erro na exportação',
					message: result?.message
				});
			}
		} catch (error) {
			console.error('Erro no controller de vídeo:', error);
		}
	}

}
