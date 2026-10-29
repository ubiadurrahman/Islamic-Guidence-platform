// src/routes/pages.routes.js
import { Router } from 'express';
import * as pagesController from '../controllers/pages.controller.js';

const router = Router();

// Public auth pages
router.get('/register', pagesController.renderRegister);
router.get('/login', pagesController.renderLogin);

// Role-aware landing page (auth enforced client-side; server always returns the shell)
router.get('/dashboard', pagesController.renderDashboard);

export default router;