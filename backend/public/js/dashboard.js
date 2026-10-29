// public/js/dashboard.js
// On load: require token, fetch /auth/me, show welcome + role-aware cards.

(async function init() {
    const token = requireToken();
    if (!token) return;

    const loading = document.getElementById('loading');
    const welcome = document.getElementById('welcome');
    const links = document.getElementById('dashboard-links');
    const scholarCard = document.getElementById('scholar-card');
    const errorEl = document.getElementById('page-error');

    const { ok, status, data } = await apiFetch('/auth/me');

    loading.hidden = true;

    if (!ok) {
        // Invalid/expired token → clear it and bounce to login
        if (status === 401) {
            clearToken();
            window.location.href = '/login';
            return;
        }
        errorEl.textContent = data?.message || `Could not load profile (${status}).`;
        errorEl.hidden = false;
        return;
    }

    // Adjust for your /auth/me response shape: { user: {...} } or { data: { user: {...} } }
    const user = data?.data?.user || data?.user;
    if (!user) {
        errorEl.textContent = 'Unexpected profile response shape.';
        errorEl.hidden = false;
        return;
    }

    welcome.textContent = `Welcome, ${user.fullName}.`; // textContent => no XSS
    links.hidden = false;

    if (user.role === 'SCHOLAR' || user.role === 'ADMIN') {
        scholarCard.hidden = false;
    }
})();