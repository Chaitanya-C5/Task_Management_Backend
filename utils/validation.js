import { body } from 'express-validator';
import { sanitizeInput, sanitizeXSS, sanitizeSearchQuery, sanitizeRouteParams } from '../middleware/sanitize.js';

export const registerValidation = [
  sanitizeInput('username'),
  sanitizeInput('email'),
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[a-zA-Z]/)
    .withMessage('Password must contain at least one letter')
];

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const createTaskValidation = [
  sanitizeXSS('title'),
  sanitizeXSS('description'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and cannot exceed 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date')
    .custom(value => {
      if (new Date(value) <= new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    }),
  
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Category must be a valid ID'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag cannot exceed 30 characters'),
  
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Estimated hours must be between 0 and 1000')
];

export const updateTaskValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date')
    .custom(value => {
      if (new Date(value) <= new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    }),
  
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Category must be a valid ID'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag cannot exceed 30 characters'),
  
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Estimated hours must be between 0 and 1000'),
  
  body('actualHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Actual hours must be non-negative')
];

export const updateStatusValidation = [
  body('status')
    .isIn(['todo', 'in-progress', 'completed', 'archived'])
    .withMessage('Status must be todo, in-progress, completed, or archived')
];

export const updatePriorityValidation = [
  body('priority')
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high')
];

export const createCategoryValidation = [
  sanitizeXSS('name'),
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category name is required and cannot exceed 50 characters'),
  
  body('color')
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color (e.g., #FF5733 or #F53)')
];

export const searchQueryValidation = [
  ...sanitizeSearchQuery
];

export const routeParamValidation = [
  ...sanitizeRouteParams
];
