/**
 * Home page routes. Kept in its own file so future features
 * (auth, questions, scholar, admin) each get their own router.
 */
import express from 'express';
import { renderHomePage } from '../controllers/home.controller.js';

const router = express.Router();

// GET /  → render the home page (HTML for now; later swap for JSON API)
router.get('/', renderHomePage);

export default router;