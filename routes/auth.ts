import express from 'express';
import { register } from '../controllers/authController';

export const authRouter = express.Router();

// Public routes
authRouter.post('/register', register);
