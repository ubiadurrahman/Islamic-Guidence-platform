import { registerUser, authenticateUser } from '../services/auth.service.js';
import { signToken } from '../utils/jwt.js';

export const register = async (req, res, next) => {
    try {
        const { email, password, fullName } = req.body;
        const user = await registerUser({ email, password, fullName });
        res.status(201).json({ status: 'success', data: { user } });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await authenticateUser({ email, password });
        const token = signToken(user);

        res.status(200).json({
            status: 'success',
            data: { user, token },
        });
    } catch (error) {
        next(error);
    }
};