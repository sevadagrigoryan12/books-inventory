import { Router } from 'express';
import { validate } from 'express-validation';
import * as walletController from '../../controllers/wallet';
import walletParamValidation from '../../config/params/wallet';

const router = Router();

/**
 * @api {get} /wallets/:userId Get Wallet Balance
 * @apiVersion 0.0.0
 * @apiName GetWalletBalance
 * @apiDescription Get the current wallet balance
 * @apiGroup Wallet
 *
 * @apiSuccess {Object} wallet Wallet information
 * @apiSuccess {Number} wallet.balance Current balance
 */
router.get('/:userId', walletController.getWalletBalance);

/**
 * @api {post} /wallets/:userId/movements Add Wallet Movement
 * @apiVersion 0.0.0
 * @apiName AddWalletMovement
 * @apiDescription Add a new wallet movement
 * @apiGroup Wallet
 *
 * @apiBody {Number} amount Movement amount
 * @apiBody {String} type Movement type (CREDIT, DEBIT)
 * @apiBody {String} description Movement description
 *
 * @apiSuccess {Object} movement Created movement
 * @apiSuccess {Number} movement.id Movement ID
 * @apiSuccess {Number} movement.amount Movement amount
 * @apiSuccess {String} movement.type Movement type
 * @apiSuccess {String} movement.description Movement description
 * @apiSuccess {Date} movement.createdAt Movement date
 */
router.post('/:userId/movements', validate(walletParamValidation.addMovement), walletController.addWalletMovement);

/**
 * @api {get} /wallets/:userId/movements Get Wallet Movements
 * @apiVersion 0.0.0
 * @apiName GetWalletMovements
 * @apiDescription Get the wallet movement history
 * @apiGroup Wallet
 *
 * @apiQuery {String} [type] Filter by movement type (CREDIT, DEBIT)
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
router.get('/:userId/movements', validate(walletParamValidation.getMovements), walletController.getMovements);

export default router; 