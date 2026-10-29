import express from 'express';
import prisma from '../config/prisma.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const result = await prisma.$queryRaw`SELECT 1 AS ok`;
        res.json({ status: 'ok', db: result });
    } catch (err) {
        next(err);
    }
});

export default router;