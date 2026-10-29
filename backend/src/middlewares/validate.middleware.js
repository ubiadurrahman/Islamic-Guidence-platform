/**
 * Reusable validation-result middleware.
 * Runs after a chain of express-validator checks.
 * If any field failed, responds with 422 and a structured error body.
 */
import { validationResult } from 'express-validator';

export const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const fields = Object.fromEntries(
            errors.array().map((error) => [error.path, error.msg])
        );

        return res.status(422).json({
            status: 'error',
            message: 'Validation failed.',
            fields,
        });
    }

    next();
};