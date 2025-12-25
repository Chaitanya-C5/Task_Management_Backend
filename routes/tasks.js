import express from 'express';
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskPriority
} from '../controllers/Task.js';
import { authenticate } from '../middleware/auth.js';
import {
  createTaskValidation,
  updateTaskValidation,
  updateStatusValidation,
  updatePriorityValidation,
  searchQueryValidation,
  routeParamValidation
} from '../utils/validation.js';

const router = express.Router();

// All task routes require authentication
router.use(authenticate);

router.post('/', createTaskValidation, createTask);

router.get('/', searchQueryValidation, getTasks);

router.get('/:id', routeParamValidation, getTask);

router.put('/:id', [...routeParamValidation, ...updateTaskValidation], updateTask);

router.delete('/:id', routeParamValidation, deleteTask);

router.put('/:id/status', [...routeParamValidation, ...updateStatusValidation], updateTaskStatus);

router.put('/:id/priority', [...routeParamValidation, ...updatePriorityValidation], updateTaskPriority);

export default router;
