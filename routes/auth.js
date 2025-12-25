import express from 'express';
import { register, login, getCurrentUser, logout } from '../controllers/User.js';
import { authenticate } from '../middleware/auth.js';
import { registerValidation, loginValidation } from '../utils/validation.js';

const router = express.Router();

router.post('/register', registerValidation, register);

router.post('/login', loginValidation, login);

router.get('/me', authenticate, getCurrentUser);

router.post('/logout', authenticate, logout);

export default router;
