import { Router } from 'express';
import { validate } from 'express-validation';
import * as walletController from '../../controllers/wallet';
import walletParamValidation from '../../config/params/wallet';

const router = Router();

/**
 * @api {get} /wallet Get Wallet Balance
 * @apiVersion 0.0.0
 * @apiName GetWalletBalance
 * @apiDescription Get the current wallet balance
 * @apiGroup Wallet
 *
 * @apiSuccess {Object} wallet Wallet information
 * @apiSuccess {Number} wallet.balance Current balance
 */
router.get('/', walletController.getWalletBalance);

/**
 * @api {get} /wallet/movements Get Wallet Movements
 * @apiVersion 0.0.0
 * @apiName GetWalletMovements
 * @apiDescription Get the wallet movement history
 * @apiGroup Wallet
 *
 * @apiQuery {String} [type] Filter by movement type (credit, debit)
 * @apiQuery {Number} [page=1] Page number
 * @apiQuery {Number} [limit=10] Items per page
 *
 * @apiSuccess {Object[]} movements List of wallet movements
 * @apiSuccess {Number} movements.id Movement ID
 * @apiSuccess {Number} movements.amount Movement amount
 * @apiSuccess {String} movements.type Movement type
 * @apiSuccess {String} movements.description Movement description
 * @apiSuccess {Date} movements.createdAt Movement date
 */
router.get('/movements', validate(walletParamValidation.getMovements), walletController.getMovements);

export default router; 