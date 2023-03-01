import express from 'express';
const router = express.Router();
import userRouters from './user.js';
import authRouters from './auth.js';

router.use(userRouters);
router.use(authRouters);

export default router;
