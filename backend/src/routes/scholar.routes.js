import express from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middlewares/validate.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/authorize.middleware.js';
import {
    listQueue,
    listMine,
    pickUp,
    clarify,
    publish,
} from '../controllers/scholar.controller.js';

const router = express.Router();

// Every route here requires an authenticated scholar or admin.
router.use(requireAuth, authorize('SCHOLAR', 'ADMIN'));

// ---- GET /scholar/questions/pending ----
router.get('/questions/pending', listQueue);

// ---- GET /scholar/questions/mine ----
router.get('/questions/mine', listMine);

// ---- POST /scholar/questions/:id/pick-up ----
router.post(
    '/questions/:id/pick-up',
    param('id').isInt({ min: 1 }).withMessage('Question id must be a positive integer.'),
    validate,
    pickUp
);

// ---- POST /scholar/questions/:id/request-clarification ----
router.post(
    '/questions/:id/request-clarification',
    param('id').isInt({ min: 1 }).withMessage('Question id must be a positive integer.'),
    body('note')
        .trim()
        .notEmpty()
        .withMessage('Clarification note is required.')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Clarification note must be between 10 and 1000 characters.'),
    validate,
    clarify
);

// ---- POST /scholar/questions/:id/answer ----
router.post(
    '/questions/:id/answer',
    param('id').isInt({ min: 1 }).withMessage('Question id must be a positive integer.'),
    body('body')
        .trim()
        .notEmpty()
        .withMessage('Answer body is required.')
        .isLength({ min: 20, max: 10000 })
        .withMessage('Answer body must be between 20 and 10000 characters.'),
    validate,
    publish
);

export default router;