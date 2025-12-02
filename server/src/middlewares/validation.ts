import type { Request, Response, NextFunction } from 'express';
import * as yup from 'yup';

export const validate = (schema: {
	body?: yup.ObjectSchema<any>;
	query?: yup.ObjectSchema<any>;
	params?: yup.ObjectSchema<any>;
}) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			if (schema.body) {
				req.body = await schema.body.validate(req.body, { abortEarly: false });
			}

			if (schema.query) {
				req.query = await schema.query.validate(req.query, { abortEarly: false });
			}

			if (schema.params) {
				req.params = await schema.params.validate(req.params, { abortEarly: false });
			}

			next();
		} catch (error) {
			if (error instanceof yup.ValidationError) {
				const errors = error.inner.map((err) => ({
					field: err.path,
					message: err.message
				}));

				return res.status(400).json({
					error: 'Dados inválidos',
					message: 'Erro de validação',
					details: errors
				});
			}

			console.error('Erro na validação:', error);
			res.status(500).json({
				error: 'Erro interno do servidor',
				message: 'Erro na validação dos dados'
			});
		}
	};
};
