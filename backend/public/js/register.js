// public/js/register.js
// Handles the /register form: POSTs to /auth/register, stores token, redirects.

const form = document.getElementById('register-form');
const errorEl = document.getElementById('form-error');
const submitBtn = document.getElementById('submit-btn');

function showError(message, fields) {
    // Build a plain-text message. If server sent field errors, list them.
    let msg = message || 'Registration failed.';
    if (fields && typeof fields === 'object') {
        const parts = Object.entries(fields).map(([k, v]) => `${k}: ${v}`);
        if (parts.length) msg += ' — ' + parts.join('; ');
    }
    errorEl.textContent = msg; // textContent => no XSS
    errorEl.hidden = false;
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorEl.hidden = true;
    submitBtn.disabled = true;

    const payload = {
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
    };

    // Client-side pre-check (server still validates — defense in depth)
    if (!payload.fullName || !payload.email || !payload.password) {
        showError('All fields are required.');
        submitBtn.disabled = false;
        return;
    }
    if (payload.password.length < 8) {
        showError('Password must be at least 8 characters.');
        submitBtn.disabled = false;
        return;
    }

    const { ok, status, data } = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    submitBtn.disabled = false;

    if (!ok) {
        // Your backend returns { status:'error', message, fields? } for 422, and { status, message } for 409
        showError(data?.message, data?.fields);
        return;
    }

    // Success: backend returns { status, data: { user, token } } (check your actual shape)
    const token = data?.data?.token || data?.token;
    if (!token) {
        showError('Registration succeeded but no token was returned. Check server response shape.');
        return;
    }
    saveToken(token);
    window.location.href = '/dashboard';
});