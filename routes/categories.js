import express from 'express';
import {
  getCategories,
  createCategory,
  deleteCategory
} from '../controllers/Category.js';
import { authenticate } from '../middleware/auth.js';
import { createCategoryValidation, routeParamValidation } from '../utils/validation.js';

const router = express.Router();

// All category routes require authentication
router.use(authenticate);

router.get('/', getCategories);

router.post('/', createCategoryValidation, createCategory);

router.delete('/:id', routeParamValidation, deleteCategory);

export default router;
