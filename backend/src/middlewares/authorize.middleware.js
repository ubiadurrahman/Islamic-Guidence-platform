/**
 * Role-based authorization. Use AFTER requireAuth.
 * Example:
 *   router.get('/scholar-only', requireAuth, authorize('SCHOLAR', 'ADMIN'), handler)
 * The role must come from req.user.role, which requireAuth set from the verified JWT.
 */
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            // Programming error: authorize() must be used after requireAuth().
            return res.status(500).json({
                status: 'error',
                message: 'Authorization middleware used without authentication.',
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'You do not have permission to perform this action.',
            });
        }

        next();
    };
};