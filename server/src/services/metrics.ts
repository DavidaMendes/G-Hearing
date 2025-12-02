import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

export class MetricsService {
	async getMostUsedMusics(limit: number = 10) {
		try {
			const mostUsed = await prisma.videoMusic.groupBy({
				by: ['music_id'],
				_count: {
					music_id: true
				},
				orderBy: {
					_count: {
						music_id: 'desc'
					}
				},
				take: limit
			});

			const musicIds = mostUsed.map(item => item.music_id);
			
			const musics = await prisma.music.findMany({
				where: {
					id: {
						in: musicIds
					}
				}
			});

			const result = mostUsed.map(item => {
				const music = musics.find(m => m.id === item.music_id);
				return {
					music: music || null,
					count: item._count.music_id
				};
			}).filter(item => item.music !== null);

			return {
				success: true,
				musics: result
			};
		} catch (error) {
			console.error('❌ [MetricsService] Erro ao buscar músicas mais usadas:', error);
			return {
				success: false,
				message: `Erro ao buscar músicas mais usadas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
				musics: []
			};
		}
	}

	async getTracksCountLastMonth() {
		try {
			const oneMonthAgo = new Date();
			oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

			const count = await prisma.videoMusic.count({
				where: {
					created_at: {
						gte: oneMonthAgo
					}
				}
			});

			return {
				success: true,
				count,
				period: {
					start: oneMonthAgo.toISOString(),
					end: new Date().toISOString()
				}
			};
		} catch (error) {
			console.error('❌ [MetricsService] Erro ao buscar quantidade de trilhas:', error);
			return {
				success: false,
				message: `Erro ao buscar quantidade de trilhas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
				count: 0
			};
		}
	}
}

