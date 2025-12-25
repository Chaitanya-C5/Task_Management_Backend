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
  updatePriorityValidation
} from '../utils/validation.js';

const router = express.Router();

router.use(authenticate);

router.post('/', createTaskValidation, createTask);

router.get('/', getTasks);

router.get('/:id', getTask);

router.put('/:id', updateTaskValidation, updateTask);

router.delete('/:id', deleteTask);

router.put('/:id/status', updateStatusValidation, updateTaskStatus);

router.put('/:id/priority', updatePriorityValidation, updateTaskPriority);

export default router;
