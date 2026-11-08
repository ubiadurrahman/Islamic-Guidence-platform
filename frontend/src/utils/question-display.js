// Shared display helpers for the QuestionStatus enum.
// Extracted at R5.3 after three copies (MyQuestionsPage, ScholarQueuePage,
// and the upcoming QuestionDetailPage). If the backend enum changes, this
// is the ONLY file that needs updating — all three pages follow.

export const STATUS_LABELS = {
    PENDING: 'Pending',
    UNDER_REVIEW: 'Under review',
    NEEDS_CLARIFICATION: 'Needs clarification',
    ANSWERED: 'Answered',
    CLOSED: 'Closed',
};

export const STATUS_BADGE_VARIANT = {
    PENDING: 'default',
    UNDER_REVIEW: 'info',
    NEEDS_CLARIFICATION: 'warning',
    ANSWERED: 'success',
    CLOSED: 'default',
};

// Locale-aware date display. Falls back to the raw ISO string if invalid,
// so a malformed backend value never crashes the page.
export function formatDate(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}