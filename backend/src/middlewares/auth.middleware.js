import { verifyToken } from '../utils/jwt.js';

/**
 * Requires a valid JWT in the Authorization header, formatted as:
 *   Authorization: Bearer <token>
 * On success, attaches { id, role } to req.user and calls next().
 * On failure, responds 401.
 */
export const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            status: 'error',
            message: 'Authentication required.',
        });
    }

    const token = authHeader.slice('Bearer '.length).trim();

    try {
        const payload = verifyToken(token);
        req.user = { id: payload.sub, role: payload.role };
        next();
    } catch (error) {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid or expired token.',
        });
    }
};