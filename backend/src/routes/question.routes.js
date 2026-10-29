import express from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middlewares/validate.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import {  getAnswer } from '../controllers/question.controller.js';
import {
    create,
    listMine,
    getMine,
} from '../controllers/question.controller.js';

const router = express.Router();

// All question routes require authentication.
router.use(requireAuth);

// ---- POST /questions ----
router.post(
    '/',
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required.')
        .isLength({ min: 5, max: 200 })
        .withMessage('Title must be between 5 and 200 characters.'),
    body('body')
        .trim()
        .notEmpty()
        .withMessage('Question body is required.')
        .isLength({ min: 10, max: 5000 })
        .withMessage('Question body must be between 10 and 5000 characters.'),
    validate,
    create
);

// ---- GET /questions/mine ----
// Placed BEFORE /questions/:id, otherwise "mine" would match as an :id.
router.get('/mine', listMine);

// ---- GET /questions/:id ----
router.get(
    '/:id',
    param('id')
        .isInt({ min: 1 })
        .withMessage('Question id must be a positive integer.'),
    validate,
    getMine
);
router.get(
    '/:id/answer',
    param('id').isInt({ min: 1 }).withMessage('Question id must be a positive integer.'),
    validate,
    getAnswer
);

export default router;