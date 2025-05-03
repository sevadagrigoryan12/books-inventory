import express from 'express';
import apiRouter from './api';
import { healthController } from '../controllers/health';
import { notFound } from '../controllers/notfound';
import config from '../config/environment/service';

const router = express.Router();

router.get('/health', healthController);
router.use(config.baseApiUrl, apiRouter);
router.use('*', notFound);

export default router;
