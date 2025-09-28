import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

export class UserService {
	async authenticate(email: string, password: string) {
		const user = await prisma.user.findUnique({
			where: { email, is_active: true }
		});

		if (!user) {
			return {
				success: false,
				message: 'Usuário ou senha incorretos'
			};
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
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
