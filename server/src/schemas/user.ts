import * as yup from 'yup';

export const userSchemas = {
	authenticate: {
		body: yup.object({
			email: yup
				.string()
				.email('Email deve ter um formato válido')
				.required('Email é obrigatório'),
			password: yup
				.string()
				.required('Senha é obrigatória')
		}).noUnknown(true)
	}
};
