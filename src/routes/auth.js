import express from 'express';
const authRouters = express.Router();
import { validate } from 'express-yup';
import {
  loginSchema,
  refreshTokenShema,
  registerSchema
} from '../controllers/user/validation.js';
import {
  login,
  register,
  refreshToken,
  logout
} from '../controllers/user/controller.js';
import auth from '../middlewares/auth.js';

authRouters.post('/auth/register', validate(registerSchema), register);

authRouters.post('/auth/login', validate(loginSchema), login);

authRouters.post('/auth/logout', auth, logout);

authRouters.post(
  '/auth/refresh-token',
  validate(refreshTokenShema),
  refreshToken
);

export default authRouters;
