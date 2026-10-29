/**
 * Validates and normalizes the scholar's reference list.
 * Each reference must be:
 *   { type: "QURAN" | "HADITH" | "OTHER", citation: string, text?: string }
 *
 * We return a NEW array of plain objects with only the allowed fields.
 * This prevents clients from stuffing arbitrary keys into the JSON column.
 */
const ALLOWED_TYPES = new Set(['QURAN', 'HADITH', 'OTHER']);
const MAX_REFERENCES = 20;

export const normalizeReferences = (references) => {
    if (references === undefined || references === null) {
        return [];
    }

    if (!Array.isArray(references)) {
        const error = new Error('References must be an array.');
        error.status = 422;
        throw error;
    }

    if (references.length > MAX_REFERENCES) {
        const error = new Error(`At most ${MAX_REFERENCES} references are allowed.`);
        error.status = 422;
        throw error;
    }

    return references.map((reference, index) => {
        if (!reference || typeof reference !== 'object') {
            const error = new Error(`Reference at index ${index} must be an object.`);
            error.status = 422;
            throw error;
        }

        const { type, citation, text } = reference;

        if (!ALLOWED_TYPES.has(type)) {
            const error = new Error(
                `Reference at index ${index} has invalid type. Allowed: QURAN, HADITH, OTHER.`
            );
            error.status = 422;
            throw error;
        }

        if (typeof citation !== 'string' || citation.trim().length === 0) {
            const error = new Error(
                `Reference at index ${index} must have a non-empty citation string.`
            );
            error.status = 422;
            throw error;
        }

        if (citation.length > 200) {
            const error = new Error(
                `Reference at index ${index} citation must be 200 characters or fewer.`
            );
            error.status = 422;
            throw error;
        }

        if (text !== undefined && (typeof text !== 'string' || text.length > 2000)) {
            const error = new Error(
                `Reference at index ${index} text must be a string of 2000 characters or fewer.`
            );
            error.status = 422;
            throw error;
        }

        return {
            type,
            citation: citation.trim(),
            ...(text ? { text: text.trim() } : {}),
        };
    });
};