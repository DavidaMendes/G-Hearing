import express from 'express';
import routes from './routes/index.js';

const app = express();

const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT || '1800000');

app.use((req, res, next) => {
	req.setTimeout(REQUEST_TIMEOUT);
	res.setTimeout(REQUEST_TIMEOUT);
	next();
});

app.use(express.json({ limit: '2gb' }));
app.use(express.urlencoded({ limit: '2gb', extended: true }));

app.use('/', routes);

app.get('/health', (req, res) => {
	res.json({ status: 'OK', message: 'Server is running!' });
});

export default app;
