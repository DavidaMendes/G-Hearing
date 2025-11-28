import type { Request, Response } from 'express';
import { MetricsService } from '../services/index.js';

const metricsService = new MetricsService();

export default class MetricsController {
	async getMostUsedMusics(req: Request, res: Response) {
		try {
			const limit = req.query.limit ? Number(req.query.limit) : 10;

			if (isNaN(limit) || limit < 1 || limit > 100) {
				return res.status(400).json({
					error: 'Parâmetro inválido',
					message: 'O parâmetro limit deve ser um número entre 1 e 100'
				});
			}

			const result = await metricsService.getMostUsedMusics(limit);

			if (result.success) {
				res.json({
					message: `${result.musics.length} música(s) encontrada(s)`,
					musics: result.musics
				});
			} else {
				res.status(500).json({
					error: 'Erro ao buscar músicas mais usadas',
					message: result.message
				});
			}
		} catch (error) {
			console.error('❌ [GET /metrics/mais-usados] Erro no controller:', error);
			res.status(500).json({
				error: 'Erro interno do servidor',
				message: 'Não foi possível buscar as músicas mais usadas'
			});
		}
	}

	async getTracksCountLastMonth(req: Request, res: Response) {
		try {
			const result = await metricsService.getTracksCountLastMonth();

			if (result.success) {
				res.json({
					message: `${result.count} trilha(s) identificada(s) no último mês`,
					count: result.count,
					period: result.period
				});
			} else {
				res.status(500).json({
					error: 'Erro ao buscar quantidade de trilhas',
					message: result.message
				});
			}
		} catch (error) {
			console.error('❌ [GET /metrics/quantidade-trilhas-ultimo-mes] Erro no controller:', error);
			res.status(500).json({
				error: 'Erro interno do servidor',
				message: 'Não foi possível buscar a quantidade de trilhas'
			});
		}
	}
}

