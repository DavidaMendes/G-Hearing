import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

export class UserService {
	async authenticate(email: string, password: string) {
		console.log('🔍 Tentativa de autenticação:', { email });
		
		const user = await prisma.user.findUnique({
			where: { email }
		});

		console.log('👤 Usuário encontrado:', user ? { id: user.id, email: user.email, is_active: user.is_active } : 'Não encontrado');

		if (!user) {
			console.log('❌ Usuário não encontrado');
			return {
				success: false,
				message: 'Usuário ou senha incorretos'
			};
		}

		if (!user.is_active) {
			console.log('❌ Usuário inativo');
			return {
				success: false,
				message: 'Usuário ou senha incorretos'
			};
		}

		console.log('🔐 Verificando senha...');
		const isPasswordValid = await bcrypt.compare(password, user.password);
		console.log('🔐 Senha válida:', isPasswordValid);

		if (!isPasswordValid) {
			console.log('❌ Senha incorreta');
			return {
				success: false,
				message: 'Usuário ou senha incorretos'
			};
		}

		const secret = process.env.JWT_SECRET as string;

		const token = jwt.sign(
			{ userId: user.id },
			secret,
			{ expiresIn: '24h' }
		);

		return {
			success: true,
			token,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				is_active: user.is_active
			}
		};
	}
}
