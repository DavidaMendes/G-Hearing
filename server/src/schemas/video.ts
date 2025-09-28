import * as yup from 'yup';

export const videoSchemas = {
	process: {
		body: yup
			.object({
				title: yup
					.string()
					.min(2, 'Título deve ter pelo menos 2 caracteres')
					.max(200, 'Título deve ter no máximo 200 caracteres')
					.required('Título é obrigatório')
			})
			.noUnknown(true)
	}
};
