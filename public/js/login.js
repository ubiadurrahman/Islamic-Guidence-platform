// public/js/login.js
// Handles /login form: POSTs to /auth/login, stores token, redirects to /dashboard.

const form = document.getElementById('login-form');
const errorEl = document.getElementById('form-error');
const submitBtn = document.getElementById('submit-btn');

function showError(message) {
    errorEl.textContent = message || 'Login failed.'; // textContent => no XSS
    errorEl.hidden = false;
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorEl.hidden = true;
    submitBtn.disabled = true;

    const payload = {
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
    };

    if (!payload.email || !payload.password) {
        showError('Email and password are required.');
        submitBtn.disabled = false;
        return;
    }

    const { ok, status, data } = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    submitBtn.disabled = false;

    if (!ok) {
        // Backend returns 401 with a generic message (account-enumeration protection).
        // Just show whatever message came back.
        showError(data?.message || `Login failed (${status}).`);
        return;
    }

    const token = data?.data?.token || data?.token;
    if (!token) {
        showError('Login succeeded but no token was returned. Check server response shape.');
        return;
    }
    saveToken(token);
    window.location.href = '/dashboard';
});