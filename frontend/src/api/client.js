// src/api/client.js
//
// Centralized HTTP client. Every network call in the app goes through here.
//
// Responsibilities:
//   - Attach Authorization: Bearer <token> when a token is stored
//   - Send and parse JSON
//   - Normalize errors into a single ApiError shape
//   - On 401 from the server, notify the app (AuthContext listens and logs out)
//
// Storage keys (MUST match AuthContext.jsx):
//   'token' — JWT string
//   'user'  — JSON-encoded user object { id, email, fullName, role, createdAt }
//
// Base URL:
//   In dev, requests go to /api/* which the Vite proxy forwards to
//   http://localhost:3000/* (stripping /api). So call api.get('/health')
//   → fetch('/api/health') → http://localhost:3000/health.
//   In production, deploy frontend and backend behind the same origin,
//   or set a VITE_API_BASE env var (out of scope for now).

export const TOKEN_KEY = 'token';
export const USER_KEY = 'user';

const API_BASE = '/api';

// ApiError — the single error type callers see.
//   status  HTTP status code (401, 422, 500, ...) or 0 for network errors
//   message human-readable message from the server, or a default
//   fields  { [fieldName]: errorMessage } for validation errors, else undefined
export class ApiError extends Error {
    constructor(status, message, fields) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.fields = fields;
    }
}

function readToken() {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

// Lower-level fetch. Not exported — use apiFetch or the `api` object below.
async function apiFetch(path, { method = 'GET', body, headers = {}, ...rest } = {}) {
    const url = `${API_BASE}${path}`;
    const finalHeaders = { ...headers };

    const token = readToken();
    if (token) {
        finalHeaders['Authorization'] = `Bearer ${token}`;
    }

    let finalBody = body;
    if (body !== undefined && body !== null && !(body instanceof FormData)) {
        if (!finalHeaders['Content-Type']) {
            finalHeaders['Content-Type'] = 'application/json';
        }
        if (typeof body !== 'string') {
            finalBody = JSON.stringify(body);
        }
    }

    let res;
    try {
        res = await fetch(url, {
            method,
            headers: finalHeaders,
            body: finalBody,
            credentials: 'include', // future-proof: works when we switch to cookies
            ...rest,
        });
    } catch (networkErr) {
        // fetch rejects only on network failures (offline, DNS, CORS block).
        // It does NOT reject on 4xx/5xx — those come back as a resolved response.
        throw new ApiError(0, 'Could not reach the server. Check your connection.');
    }

    // 401 handling: notify the app. Do this BEFORE parsing body so a broken
    // 401 body can't hide the event. AuthContext will clear storage + redirect.
    if (res.status === 401) {
        try {
            window.dispatchEvent(new Event('auth:unauthorized'));
        } catch {
            /* SSR / non-browser environment — ignore */
        }
    }

    // 204 No Content has no body. Return null.
    if (res.status === 204) {
        return null;
    }

    // Try to parse JSON. If the body isn't JSON, surface a friendly error.
    let payload;
    try {
        payload = await res.json();
    } catch {
        throw new ApiError(res.status, `Server returned non-JSON response (${res.status}).`);
    }

    if (!res.ok) {
        // Backend's standard error shape: { status: 'error', message, fields? }
        const message =
            (payload && payload.message) || `Request failed (${res.status}).`;
        const fields = payload && payload.fields;
        throw new ApiError(res.status, message, fields);
    }

    // Backend's success shape: { status: 'success', data: { ... } }
    // Unwrap `data` so callers get `{ user, token }`, `{ questions }`, etc.
    // If the response doesn't follow this envelope (e.g., /health), return
    // the payload as-is.
    if (payload && typeof payload === 'object' && 'data' in payload && payload.status === 'success') {
        return payload.data;
    }
    return payload;
}

// Public convenience methods. All return the unwrapped `data` object
// (or throw ApiError).
export const api = {
    get: (path, options) => apiFetch(path, { ...options, method: 'GET' }),
    post: (path, body, options) => apiFetch(path, { ...options, method: 'POST', body }),
    put: (path, body, options) => apiFetch(path, { ...options, method: 'PUT', body }),
    patch: (path, body, options) => apiFetch(path, { ...options, method: 'PATCH', body }),
    delete: (path, options) => apiFetch(path, { ...options, method: 'DELETE' }),
};