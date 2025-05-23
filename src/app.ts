import express from 'express';
import routes from './routes';
import { errorHandler } from './middlewares/error';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', routes);

app.use(errorHandler);

export default app;
