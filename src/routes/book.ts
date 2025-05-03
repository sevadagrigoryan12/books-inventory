import { Router } from 'express';
import { searchBooks, getBookDetails, getBookActions, borrowBook, returnBook, buyBook, getUserBooks } from '../controllers/book';
import { isAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/search', searchBooks);
router.get('/:id', getBookDetails);
router.get('/:id/actions', getBookActions);

// User routes
router.post('/:id/borrow', borrowBook);
router.post('/:id/return', returnBook);
router.post('/:id/buy', buyBook);

// Admin routes
router.get('/user/:userId', isAdmin, getUserBooks);

export default router; 