/**
 * Health controller — handles GET /health.
 * Returns JSON so monitoring tools and future React clients can check status.
 */
export const getHealth = (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'islamic-guidance-platform',
        timestamp: new Date().toISOString(),
    });
};