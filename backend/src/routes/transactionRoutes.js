import express from 'express';
import {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsSummary
} from '../controllers/transactionController.js';
import {
  validateTransaction,
  validateTransactionUpdate,
  validateUUID,
  sanitizeInput
} from '../middleware/validator.js';

const router = express.Router();

// Apply sanitizeInput to all routes
router.use(sanitizeInput);

// GET routes
router.get('/', getAllTransactions);
router.get('/summary', getTransactionsSummary);
router.get('/:id', validateUUID, getTransactionById);

// POST route
router.post('/', validateTransaction, createTransaction);

// PUT route
router.put('/:id', validateUUID, validateTransactionUpdate, updateTransaction);

// DELETE route
router.delete('/:id', validateUUID, deleteTransaction);

export default router;