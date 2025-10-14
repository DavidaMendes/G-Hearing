import type { Request, Response } from 'express';
import { UserService } from '../services/index.js';

const userService = new UserService();

export default class UserController {
	async authenticate(req: Request, res: Response) {
		try {
			const { email, password } = req.body;

			const result = await userService.authenticate(email, password);

			if (!result.success) {
				return res.status(401).json({
					error: 'Falha na autenticação',
					message: result.message
				});
			}

			res.json({
				message: 'Autenticação realizada com sucesso',
				token: result.token,
				user: result.user
			});

		} catch (error) {
			console.error('Erro na autenticação:', error);
			res.status(500).json({
				error: 'Erro interno do servidor',
				message: 'Não foi possível realizar a autenticação'
			});
		}
	}
}
