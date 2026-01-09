import express from 'express';
import {
  getAllCategories,
  createCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import {
  validateCategory,
  validateUUID,
  sanitizeInput
} from '../middleware/validator.js';

const router = express.Router();
// Apply sanitizeInput to all routes
router.use(sanitizeInput);
// GET route
router.get('/', getAllCategories);
// POST route
router.post('/', validateCategory, createCategory);
// DELETE route
router.delete('/:id', validateUUID, deleteCategory);
export default router;