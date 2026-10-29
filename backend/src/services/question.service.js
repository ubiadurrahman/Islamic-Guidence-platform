import prisma from '../config/prisma.js';

/**
 * Fields we expose in API responses.
 * Kept in one place so every question endpoint returns a consistent shape.
 * Notice: we never include internal columns here.
 */
const publicQuestionSelect = {
    id: true,
    title: true,
    body: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    author: {
        select: {
            id: true,
            fullName: true,
        },
    },
};

/**
 * Creates a new question owned by authorId.
 * Status defaults to PENDING at the DB level, so we don't set it here.
 */
export const createQuestion = async ({ authorId, title, body }) => {
    return prisma.question.create({
        data: { authorId, title, body },
        select: publicQuestionSelect,
    });
};

/**
 * Lists questions belonging to a single user.
 * Newest first. Pagination comes later — for now we return a capped
 * list so a buggy client can't accidentally request millions of rows.
 */
export const listQuestionsForUser = async (authorId) => {
    return prisma.question.findMany({
        where: { authorId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: publicQuestionSelect,
    });
};

/**
 * Fetches one question by id, but ONLY if it belongs to authorId.
 * Returning null for "not found" and "belongs to someone else" is
 * deliberate: it prevents an attacker from learning which ids exist.
 */
export const getQuestionForUser = async ({ questionId, authorId }) => {
    return prisma.question.findFirst({
        where: { id: questionId, authorId },
        select: publicQuestionSelect,
    });
};
/**
 * Returns the published answer for a question, but ONLY if the caller
 * is the question's author or the question is ANSWERED (in which case
 * we consider it publicly readable — adjust this when you add
 * public Q&A browsing).
 *
 * For now, we restrict to the author. Public browsing is a future feature.
 */
export const getAnswerForQuestion = async ({ questionId, requesterId }) => {
    const question = await prisma.question.findUnique({
        where: { id: questionId },
        select: {
            id: true,
            authorId: true,
            status: true,
            answer: {
                select: {
                    id: true,
                    body: true,
                    references: true,
                    createdAt: true,
                    scholar: {
                        select: { id: true, fullName: true },
                    },
                },
            },
        },
    });

    if (!question) return null;
    if (question.authorId !== requesterId) return null; // hide from non-authors
    if (!question.answer) return null;                   // not answered yet

    return {
        status: question.status,
        answer: question.answer,
    };
};