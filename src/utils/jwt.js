/**
 * Small JWT helper. Keeps signing/verifying in one place
 * so we do not repeat the secret and options everywhere.
 */
import jwt from 'jsonwebtoken';
import { jwtSecret, jwtExpiresIn } from '../config/env.js';

/**
 * Sign a token containing the user's id and role.
 * We deliberately keep the payload small — never put email,
 * password hash, or personal info inside a JWT, because
 * the payload is only signed, not encrypted.
 */
export const signToken = (user) => {
    return jwt.sign(
        { sub: user.id, role: user.role },
        jwtSecret,
        { expiresIn: jwtExpiresIn }
    );
};

/**
 * Verify a token. Returns the decoded payload, or throws.
 * `sub` (subject) is the standard JWT claim for "who this token is about".
 */
export const verifyToken = (token) => {
    return jwt.verify(token, jwtSecret);
};