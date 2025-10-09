import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3333;

const server = app.listen(
	{
		host: '0.0.0.0',
		port: PORT
	},
	() => {
		console.log('HTTP Server is running on port ' + PORT);
	}
);

const TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT || '1800000');

server.timeout = TIMEOUT;
