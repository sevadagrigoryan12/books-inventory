import { Router } from 'express';

import { healthController } from '../../controllers/health';
import books from './books';
import wallet from './wallet';
import users from './users';

const router = Router();

router.use('/books', books);

router.use('/wallets', wallet);

router.use('/users', users);


/**
 * @api {get} /health Request Health information
 * @apiVersion 0.0.0
 * @apiName GetHealth
 * @apiDescription Provides health of the service.
 * @apiGroup Health
 *
 * @apiSuccess {Object} health Health of the Service.
 * @apiSuccess {String} health.status Status.
 * @apiSuccess {String} health.date Date.
 *
 * @apiError {Object} error Error description
 */
router.get('/health', healthController);

export default router;
