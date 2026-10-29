/**
 * Creates and configures the Express application.
 * We do NOT call app.listen() here — see src/server.js for that.
 * Separating app from server makes future testing easier.
 */
import path from 'node:path';
import express from 'express';

// Routers
import homeRouter from './routes/home.routes.js';
import healthRouter from './routes/health.routes.js';
import dbPingRouter from './routes/db-ping.routes.js';
import authRouter from './routes/auth.routes.js';
import questionRouter from './routes/question.routes.js';
import scholarRouter from './routes/scholar.routes.js';
import pagesRoutes from './routes/pages.routes.js';

const app = express();

// ---------- View engine (EJS) ----------
app.set('view engine', 'ejs');
app.set('views', path.join(import.meta.dirname, 'views'));

// ---------- Static files ----------
// Requests to /css/..., /js/..., /images/... are served from public/
app.use(express.static(path.join(import.meta.dirname, '..', 'public')));

// ---------- Body parsers ----------
// Parse URL-encoded form submissions and JSON (for future API clients like React)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ---------- Routes ----------
app.use('/', homeRouter);
app.use('/health', healthRouter);
app.use('/db-ping', dbPingRouter);
app.use('/auth', authRouter);
app.use('/questions', questionRouter);
app.use('/scholar', scholarRouter);
app.use('/', pagesRoutes);

// ---------- 404 handler ----------
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// ---------- Central error handler ----------
// Express recognizes this as an error handler because it has FOUR arguments.
app.use((err, req, res, next) => {
    console.error('[error]', err.message);

    const statusCode = err.status || 500;
    const message =
        process.env.NODE_ENV === 'production'
            ? 'Something went wrong.'
            : err.message;

    res.status(statusCode).json({
        status: 'error',
        message,
    });
});

export default app;