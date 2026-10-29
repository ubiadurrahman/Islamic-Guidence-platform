import prisma from '../config/prisma.js';
import { normalizeReferences } from './reference.validator.js';

const scholarQuestionSelect = {
    id: true,
    title: true,
    body: true,
    status: true,
    clarificationNote: true,
    createdAt: true,
    updatedAt: true,
    author: {
        select: { id: true, fullName: true },
    },
    scholar: {
        select: { id: true, fullName: true },
    },
    answer: {
        select: {
            id: true,
            body: true,
            references: true,
            createdAt: true,
        },
    },
};

/**
 * Returns the queue of questions waiting for a scholar.
 * PENDING first, then UNDER_REVIEW (already picked up by someone).
 * This gives scholars a single "work queue" view.
 */
export const listPendingQueue = async () => {
    return prisma.question.findMany({
        where: { status: { in: ['PENDING', 'UNDER_REVIEW'] } },
        orderBy: { createdAt: 'asc' }, // oldest first — fairness
        take: 50,
        select: scholarQuestionSelect,
    });
};

/**
 * Questions this scholar has picked up (and not yet closed).
 */
export const listScholarQuestions = async (scholarId) => {
    return prisma.question.findMany({
        where: {
            scholarId,
            status: { in: ['UNDER_REVIEW', 'NEEDS_CLARIFICATION', 'ANSWERED'] },
        },
        orderBy: { updatedAt: 'desc' },
        take: 50,
        select: scholarQuestionSelect,
    });
};

/**
 * Picks up a PENDING question for review.
 * Fails if the question is not PENDING, or already assigned to another scholar.
 */
export const pickUpQuestion = async ({ questionId, scholarId }) => {
    const question = await prisma.question.findUnique({
        where: { id: questionId },
        select: { id: true, status: true, scholarId: true },
    });

    if (!question) {
        const error = new Error('Question not found.');
        error.status = 404;
        throw error;
    }

    if (question.status !== 'PENDING') {
        const error = new Error(
            `Cannot pick up a question in status ${question.status}.`
        );
        error.status = 409;
        throw error;
    }

    if (question.scholarId !== null) {
        const error = new Error('This question has already been picked up.');
        error.status = 409;
        throw error;
    }

    return prisma.question.update({
        where: { id: questionId },
        data: {
            scholarId,
            status: 'UNDER_REVIEW',
        },
        select: scholarQuestionSelect,
    });
};

/**
 * Sets clarificationNote on an UNDER_REVIEW question and moves to NEEDS_CLARIFICATION.
 */
export const requestClarification = async ({ questionId, scholarId, note }) => {
    const question = await prisma.question.findUnique({
        where: { id: questionId },
        select: { id: true, status: true, scholarId: true },
    });

    if (!question) {
        const error = new Error('Question not found.');
        error.status = 404;
        throw error;
    }

    if (question.scholarId !== scholarId) {
        const error = new Error('You are not assigned to this question.');
        error.status = 403;
        throw error;
    }

    if (question.status !== 'UNDER_REVIEW') {
        const error = new Error(
            `Cannot request clarification in status ${question.status}.`
        );
        error.status = 409;
        throw error;
    }

    return prisma.question.update({
        where: { id: questionId },
        data: {
            clarificationNote: note,
            status: 'NEEDS_CLARIFICATION',
        },
        select: scholarQuestionSelect,
    });
};

/**
 * Publishes an answer and moves the question to ANSWERED.
 * Both operations happen in a transaction so we never end up with
 * an Answer row that has no matching ANSWERED status (or vice versa).
 */
export const publishAnswer = async ({ questionId, scholarId, body, references }) => {
    const normalizedReferences = normalizeReferences(references);

    const question = await prisma.question.findUnique({
        where: { id: questionId },
        select: { id: true, status: true, scholarId: true },
    });

    if (!question) {
        const error = new Error('Question not found.');
        error.status = 404;
        throw error;
    }

    if (question.scholarId !== scholarId) {
        const error = new Error('You are not assigned to this question.');
        error.status = 403;
        throw error;
    }

    if (!['UNDER_REVIEW', 'NEEDS_CLARIFICATION'].includes(question.status)) {
        const error = new Error(
            `Cannot publish an answer in status ${question.status}.`
        );
        error.status = 409;
        throw error;
    }

    const result = await prisma.$transaction(async (tx) => {
        const answer = await tx.answer.create({
            data: {
                questionId,
                scholarId,
                body,
                references: normalizedReferences,
            },
            select: {
                id: true,
                body: true,
                references: true,
                createdAt: true,
            },
        });

        const updatedQuestion = await tx.question.update({
            where: { id: questionId },
            data: {
                status: 'ANSWERED',
                clarificationNote: null,
            },
            select: scholarQuestionSelect,
        });

        return { answer, question: updatedQuestion };
    });

    return result;
};