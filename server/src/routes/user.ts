import express from 'express';
import { UserController } from '../controllers/index.js';
import { validate } from '../middlewares/index.js';
import { userSchemas } from '../schemas/index.js';

const router = express.Router();
const userController = new UserController();

router.post('/auth', validate(userSchemas.authenticate), userController.authenticate.bind(userController));

export default router;
