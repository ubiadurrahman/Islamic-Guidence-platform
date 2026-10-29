import express from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/authorize.middleware.js';

const router = express.Router();

// ---- POST /auth/register ----
router.post(
    '/register',
    body('email')
        .trim()
        .isEmail()
        .withMessage('A valid email address is required.')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long.'),
    body('fullName')
        .trim()
        .notEmpty()
        .withMessage('Full name is required.')
        .isLength({ max: 100 })
        .withMessage('Full name must be 100 characters or fewer.'),
    validate,
    register
);

// ---- POST /auth/login ----
router.post(
    '/login',
    body('email')
        .trim()
        .isEmail()
        .withMessage('A valid email address is required.')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required.'),
    validate,
    login
);

// ---- GET /auth/me — any authenticated user ----
router.get('/me', requireAuth, (req, res) => {
    res.status(200).json({
        status: 'success',
        data: { user: req.user },
    });
});

// ---- GET /auth/scholar-only — temporary authorization smoke test ----
router.get('/scholar-only', requireAuth, authorize('SCHOLAR', 'ADMIN'), (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'You are a scholar or admin.',
        data: { user: req.user },
    });
});

export default router;