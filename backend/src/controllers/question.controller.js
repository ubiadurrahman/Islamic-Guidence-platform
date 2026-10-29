import {
    createQuestion,
    listQuestionsForUser,
    getQuestionForUser,
} from '../services/question.service.js';

export const create = async (req, res, next) => {
    try {
        const { title, body } = req.body;
        const question = await createQuestion({
            authorId: req.user.id,
            title,
            body,
        });
        res.status(201).json({ status: 'success', data: { question } });
    } catch (error) {
        next(error);
    }
};

export const listMine = async (req, res, next) => {
    try {
        const questions = await listQuestionsForUser(req.user.id);
        res.status(200).json({ status: 'success', data: { questions } });
    } catch (error) {
        next(error);
    }
};

export const getMine = async (req, res, next) => {
    try {
        // req.params.id is a string from the URL; validation confirmed it is an int.
        // Convert explicitly — Prisma does NOT coerce strings to ints automatically.
        const questionId = Number(req.params.id);
        const question = await getQuestionForUser({
            questionId,
            authorId: req.user.id,
        });

        if (!question) {
            return res.status(404).json({
                status: 'error',
                message: 'Question not found.',
            });
        }

        res.status(200).json({ status: 'success', data: { question } });
    } catch (error) {
        next(error);
    }
};
import { getAnswerForQuestion } from '../services/question.service.js';

export const getAnswer = async (req, res, next) => {
    try {
        const questionId = Number(req.params.id);
        const result = await getAnswerForQuestion({
            questionId,
            requesterId: req.user.id,
        });

        if (!result) {
            return res.status(404).json({
                status: 'error',
                message: 'Answer not found.',
            });
        }

        res.status(200).json({ status: 'success', data: result });
    } catch (error) {
        next(error);
    }
};