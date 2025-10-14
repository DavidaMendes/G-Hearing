import express from 'express';
import routes from './routes/index.js';

const app = express();

app.use(express.json());

app.use('/', routes);

app.get('/health', (req, res) => {
	res.json({ status: 'OK', message: 'Server is running!' });
});

export default app;
