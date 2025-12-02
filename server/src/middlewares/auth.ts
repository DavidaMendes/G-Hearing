import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
	userId?: number;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
	const authHeader = req.headers['authorization'] as string;
	const token = authHeader?.split(' ')[1];

	if (!token) {
		return res.status(401).json({
			error: 'Token não fornecido',
			message: 'Token de autenticação é obrigatório'
		});
	}

	const secret = process.env.JWT_SECRET as string;
	if (!secret) {
		return res.status(500).json({
			error: 'Erro de configuração',
			message: 'JWT_SECRET não configurado'
		});
	}

	jwt.verify(token, secret, (err: any, decoded: any) => {
		if (err) {
			return res.status(403).json({
				error: 'Token inválido',
				message: 'Token de autenticação inválido ou expirado'
			});
		}

		req.userId = decoded.userId;
		next();
	});
};
