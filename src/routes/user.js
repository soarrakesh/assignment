import express from 'express';
import { getOne, list, updateOne } from '../controllers/user/controller.js';
import { validate } from 'express-yup';
import { userIdParamSchema } from '../controllers/user/validation.js';
import auth from '../middlewares/auth.js';

const userRouters = express.Router();

userRouters.get('/users', auth, list);

userRouters.get('/users/:id', auth, validate(userIdParamSchema), getOne);

userRouters.put('/users/:id', auth, validate(userIdParamSchema), updateOne);

export default userRouters;
