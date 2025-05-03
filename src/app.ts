import express from 'express';
import routes from './routes';
import { errorHandler, notFoundHandler, validationErrorHandler } from './utils/error';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.use(validationErrorHandler);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
