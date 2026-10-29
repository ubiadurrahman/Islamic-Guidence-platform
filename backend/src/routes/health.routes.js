/**
 * Health-check router.
 * Useful for uptime monitoring, container health checks, and smoke tests.
 */
import express from 'express';
import { getHealth } from '../controllers/health.controller.js';

const router = express.Router();

// GET /health → returns { status: 'ok', ... }
router.get('/', getHealth);

export default router;