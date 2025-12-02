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
			
			if (!videoId || isNaN(Number(videoId))) {
				return res.status(400).json({
					error: 'ID de vídeo inválido',
					message: 'O ID do vídeo deve ser um número válido'
				});
			}

			const result = await videoService.getAudiosByVideoId(Number(videoId));
			
			if (!result || result.length === 0) {
				return res.status(404).json({
					error: 'Nenhum áudio encontrado',
					message: `Não foram encontrados áudios para o vídeo com ID ${videoId}`
				});
			}

			res.json({
				message: `${result.length} música(s) encontrada(s)`,
				musics: result
			});
		} catch (error) {
			console.error('❌ [GET /videos/:videoId/audios] Erro no controller:', error);
			res.status(500).json({
				error: 'Erro interno do servidor',
				message: 'Não foi possível buscar os áudios do vídeo'
			});
		}
	}

	async deleteVideo(req: AuthRequest, res: Response) {
		try {
			if (!req.userId) {
				return res.status(401).json({
					error: 'Usuário não autenticado',
					message: 'Token de autenticação inválido'
				});
			}

			const { videoId } = req.params;

			if (!videoId || isNaN(Number(videoId))) {
				return res.status(400).json({
					error: 'ID de vídeo inválido',
					message: 'O ID do vídeo deve ser um número válido'
				});
			}

			const result = await videoService.deleteVideo(Number(videoId));

			if (result.success) {
				res.json({
					message: 'Vídeo deletado com sucesso'
				});
			} else {
				res.status(404).json({
					error: 'Vídeo não encontrado',
					message: result.message
				});
			}
		} catch (error) {
			console.error('❌ [DELETE /videos/:videoId] Erro no controller:', error);
			res.status(500).json({
				error: 'Erro interno do servidor',
				message: 'Não foi possível deletar o vídeo'
			});
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

	async listVideos(req: AuthRequest, res: Response) {
		try {
			console.log('📋 [GET /videos] Requisição recebida para listar vídeos');
			
			// Se o usuário estiver autenticado, pode filtrar apenas seus vídeos
			// Se não estiver autenticado, lista todos (ou pode retornar erro)
			const userId = req.userId;

			if (userId) {
				console.log(`👤 Usuário autenticado (ID: ${userId}) - Filtrando vídeos do usuário`);
			} else {
				console.log('⚠️ Nenhum usuário autenticado - Listando todos os vídeos');
			}

			const result = await videoService.listVideos(userId);

			if (result.success) {
				console.log(`✅ [GET /videos] Sucesso! ${result.total} vídeo(s) encontrado(s)`);
				
				if (result.total > 0) {
					console.log('📹 Detalhes dos vídeos:');
					result.videos.forEach((video, index) => {
						console.log(`   ${index + 1}. ID: ${video.id} | Título: "${video.title}"`);
						console.log(`      Status: ${video.processingStatus} | Músicas: ${video.musics.length}`);
						console.log(`      Upload: ${new Date(video.uploadDate).toLocaleString('pt-BR')}`);
					});
				} else {
					console.log('ℹ️ Nenhum vídeo encontrado no banco de dados');
				}

				res.json({
					message: `${result.total} vídeo(s) encontrado(s)`,
					videos: result.videos,
					total: result.total
				});
			} else {
				console.error(`❌ [GET /videos] Erro ao listar vídeos: ${result.message}`);
				res.status(500).json({
					error: 'Erro ao listar vídeos',
					message: result.message
				});
			}
		} catch (error) {
			console.error('❌ [GET /videos] Erro no controller de listagem de vídeos:', error);
			console.error('   Stack trace:', error instanceof Error ? error.stack : 'N/A');
			res.status(500).json({
				error: 'Erro interno do servidor',
				message: 'Não foi possível listar os vídeos'
			});
		}
	}

	async listVideosSummary(req: AuthRequest, res: Response) {
		try {
			console.log('📋 [GET /videos/summary] Requisição recebida para listar resumo de vídeos');
			
			const userId = req.userId;

			if (userId) {
				console.log(`👤 Usuário autenticado (ID: ${userId}) - Filtrando vídeos do usuário`);
			} else {
				console.log('⚠️ Nenhum usuário autenticado - Listando todos os vídeos');
			}

			const result = await videoService.listVideosSummary(userId);

			if (result.success) {
				console.log(`✅ [GET /videos/summary] Sucesso! ${result.total} vídeo(s) encontrado(s)`);
				
				if (result.total > 0) {
					console.log('📹 Detalhes dos vídeos:');
					result.videos.forEach((video, index) => {
						console.log(`   ${index + 1}. ID: ${video.id} | Título: "${video.title}"`);
						console.log(`      Status: ${video.processingStatus} | Músicas: ${video.musicCount}`);
						console.log(`      Upload: ${new Date(video.uploadDate).toLocaleString('pt-BR')}`);
					});
				} else {
					console.log('ℹ️ Nenhum vídeo encontrado no banco de dados');
				}

				res.json({
					message: `${result.total} vídeo(s) encontrado(s)`,
					videos: result.videos,
					total: result.total
				});
			} else {
				console.error(`❌ [GET /videos/summary] Erro ao listar resumo de vídeos: ${result.message}`);
				res.status(500).json({
					error: 'Erro ao listar resumo de vídeos',
					message: result.message
				});
			}
		} catch (error) {
			console.error('❌ [GET /videos/summary] Erro no controller de resumo de vídeos:', error);
			console.error('   Stack trace:', error instanceof Error ? error.stack : 'N/A');
			res.status(500).json({
				error: 'Erro interno do servidor',
				message: 'Não foi possível listar o resumo dos vídeos'
			});
		}
	}
}
