import { Router } from 'express';
import { validate } from 'express-validation';
import * as bookController from '../../controllers/book';
import bookParamValidation from '../../config/params/book';

const router = Router();

/**
 * @api {get} /books Search Books
 * @apiVersion 0.0.0
 * @apiName SearchBooks
 * @apiDescription Search books by title, author, or genre
 * @apiGroup Books
 *
 * @apiQuery {String} [query] Search query for title, author, or genre
 * @apiQuery {String} [author] Filter by author name
 * @apiQuery {String} [genre] Filter by genre
 * @apiQuery {Number} [page=1] Page number
 * @apiQuery {Number} [limit=10] Items per page
 *
 * @apiSuccess {Object[]} books List of books
 * @apiSuccess {Number} books.id Book ID
 * @apiSuccess {String} books.authorName Author name
 * @apiSuccess {String} books.bookTitle Book title
 * @apiSuccess {String[]} books.genres Book genres
 * @apiSuccess {Number} books.sellPrice Sell price
 * @apiSuccess {Number} books.borrowPrice Borrow price
 * @apiSuccess {Number} books.copies Available copies
 */
router.get('/', validate(bookParamValidation.search), bookController.searchBooks);

/**
 * @api {get} /books/:id Get Book Details
 * @apiVersion 0.0.0
 * @apiName GetBookDetails
 * @apiDescription Get detailed information about a specific book
 * @apiGroup Books
 *
 * @apiParam {Number} id Book ID
 *
 * @apiSuccess {Object} book Book details
 * @apiSuccess {Number} book.id Book ID
 * @apiSuccess {String} book.authorName Author name
 * @apiSuccess {String} book.bookTitle Book title
 * @apiSuccess {String[]} book.genres Book genres
 * @apiSuccess {Number} book.sellPrice Sell price
 * @apiSuccess {Number} book.borrowPrice Borrow price
 * @apiSuccess {Number} book.copies Available copies
 */
router.get('/:id', validate(bookParamValidation.getDetails), bookController.getBookDetails);

/**
 * @api {get} /books/:id/actions Get Book Actions
 * @apiVersion 0.0.0
 * @apiName GetBookActions
 * @apiDescription Get actions performed on a specific book
 * @apiGroup Books
 *
 * @apiParam {Number} id Book ID
 * @apiQuery {String} [actionType] Filter by action type (borrow, return, buy, restock)
 * @apiQuery {String} [userId] Filter by user ID
 * @apiQuery {Number} [page=1] Page number
 * @apiQuery {Number} [limit=10] Items per page
 *
 * @apiSuccess {Object[]} actions List of actions
 */
router.get('/:id/actions', validate(bookParamValidation.getActions), bookController.getBookActions);

/**
 * @api {post} /books/:id/borrow Borrow Book
 * @apiVersion 0.0.0
 * @apiName BorrowBook
 * @apiDescription Borrow a book copy
 * @apiGroup Books
 *
 * @apiParam {Number} id Book ID
 * @apiHeader {String} user-email User's email
 *
 * @apiSuccess {Object} result Borrow result
 * @apiSuccess {Boolean} result.success Whether the borrow was successful
 */
router.post('/:id/borrow', validate(bookParamValidation.borrow), bookController.borrowBook);

/**
 * @api {post} /books/:id/return Return Book
 * @apiVersion 0.0.0
 * @apiName ReturnBook
 * @apiDescription Return a borrowed book copy
 * @apiGroup Books
 *
 * @apiParam {Number} id Book ID
 * @apiHeader {String} user-email User's email
 *
 * @apiSuccess {Object} result Return result
 * @apiSuccess {Boolean} result.success Whether the return was successful
 */
router.post('/:id/return', validate(bookParamValidation.return), bookController.returnBook);

/**
 * @api {post} /books/:id/buy Buy Book
 * @apiVersion 0.0.0
 * @apiName BuyBook
 * @apiDescription Buy a book copy
 * @apiGroup Books
 *
 * @apiParam {Number} id Book ID
 * @apiHeader {String} user-email User's email
 *
 * @apiSuccess {Object} result Buy result
 * @apiSuccess {Boolean} result.success Whether the purchase was successful
 */
router.post('/:id/buy', validate(bookParamValidation.buy), bookController.buyBook);

export default router; 