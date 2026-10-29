import {
    listPendingQueue,
    listScholarQuestions,
    pickUpQuestion,
    requestClarification,
    publishAnswer,
} from '../services/scholar.service.js';

export const listQueue = async (req, res, next) => {
    try {
        const questions = await listPendingQueue();
        res.status(200).json({ status: 'success', data: { questions } });
    } catch (error) {
        next(error);
    }
};

export const listMine = async (req, res, next) => {
    try {
        const questions = await listScholarQuestions(req.user.id);
        res.status(200).json({ status: 'success', data: { questions } });
    } catch (error) {
        next(error);
    }
};

export const pickUp = async (req, res, next) => {
    try {
        const questionId = Number(req.params.id);
        const question = await pickUpQuestion({
            questionId,
            scholarId: req.user.id,
        });
        res.status(200).json({ status: 'success', data: { question } });
    } catch (error) {
        next(error);
    }
};

export const clarify = async (req, res, next) => {
    try {
        const questionId = Number(req.params.id);
        const { note } = req.body;
        const question = await requestClarification({
            questionId,
            scholarId: req.user.id,
            note,
        });
        res.status(200).json({ status: 'success', data: { question } });
    } catch (error) {
        next(error);
    }
};

export const publish = async (req, res, next) => {
    try {
        const questionId = Number(req.params.id);
        const { body, references } = req.body;
        const result = await publishAnswer({
            questionId,
            scholarId: req.user.id,
            body,
            references,
        });
        res.status(201).json({ status: 'success', data: result });
    } catch (error) {
        next(error);
    }
};