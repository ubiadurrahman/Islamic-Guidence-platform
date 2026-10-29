import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';

const SALT_ROUNDS = 12;

export const registerUser = async ({ email, password, fullName }) => {
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        const error = new Error('An account with this email already exists.');
        error.status = 409;
        throw error;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
        data: { email, passwordHash, fullName },
        select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            createdAt: true,
        },
    });

    return user;
};

/**
 * Verifies credentials. Returns the user (without passwordHash) on success.
 * Throws 401 for BOTH wrong email and wrong password — deliberately identical
 * messages, so an attacker cannot tell which one was wrong.
 */
export const authenticateUser = async ({ email, password }) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    // Same generic error whether the email exists or not.
    const invalidCredentials = () => {
        const error = new Error('Invalid email or password.');
        error.status = 401;
        return error;
    };

    if (!user) {
        throw invalidCredentials();
    }

    if (!user.isActive) {
        const error = new Error('This account has been disabled.');
        error.status = 403;
        throw error;
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
        throw invalidCredentials();
    }

    // Return a sanitized object — never return passwordHash.
    return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        createdAt: user.createdAt,
    };
};