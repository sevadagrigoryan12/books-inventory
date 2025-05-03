import { Router } from 'express';
import { validate } from 'express-validation';
import * as userController from '../../controllers/user';
import userParamValidation from '../../config/params/user';

const router = Router();

/**
 * @api {get} /users/:email/books Get User Books
 * @apiVersion 0.0.0
 * @apiName GetUserBooks
 * @apiDescription Get books borrowed or bought by a user
 * @apiGroup Users
 *
 * @apiParam {String} email User's email
 * @apiQuery {String} [type] Filter by book type (borrowed, bought)
 * @apiQuery {String} [status] Filter by book status (active, returned)
 * @apiQuery {Number} [page=1] Page number
 * @apiQuery {Number} [limit=10] Items per page
 *
 * @apiSuccess {Object[]} books List of user's books
 * @apiSuccess {Number} books.id Book ID
 * @apiSuccess {String} books.type Book type (borrowed, bought)
 * @apiSuccess {String} books.status Book status (active, returned)
 * @apiSuccess {Date} books.createdAt Borrow/Buy date
 */
router.get('/:email/books', validate(userParamValidation.getBooks), userController.getUserBooks);

export default router; 