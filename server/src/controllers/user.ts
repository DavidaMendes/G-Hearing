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

	async createAdmin(req: Request, res: Response) {
		try {
			const bcrypt = await import('bcrypt');
			const { PrismaClient } = await import('../generated/prisma/index.js');
			const prisma = new PrismaClient();

			// Verificar se já existe um admin
			const existingAdmin = await prisma.user.findUnique({
				where: { email: 'admin@ghearing.com' }
			});

			if (existingAdmin) {
				return res.json({
					message: 'Usuário admin já existe',
					user: {
						id: existingAdmin.id,
						name: existingAdmin.name,
						email: existingAdmin.email
					}
				});
			}

			// Criar usuário admin
			const hashedPassword = await bcrypt.default.hash('admin123', 10);
			
			const admin = await prisma.user.create({
				data: {
					name: 'Administrador',
					email: 'admin@ghearing.com',
					password: hashedPassword,
					is_active: true
				}
			});

			res.json({
				message: 'Usuário admin criado com sucesso',
				user: {
					id: admin.id,
					name: admin.name,
					email: admin.email
				}
			});

		} catch (error) {
			console.error('Erro ao criar admin:', error);
			res.status(500).json({
				error: 'Erro interno do servidor',
				message: 'Não foi possível criar o usuário admin'
			});
		}
	}
}
