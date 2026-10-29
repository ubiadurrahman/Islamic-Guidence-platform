// public/js/auth.js
// Shared auth + fetch helpers loaded on every page.
//
// XSS CAVEAT: JWT is stored in localStorage. Any XSS can steal it.
// We avoid XSS by never using innerHTML with untrusted data (use textContent)
// and by never reflecting user input into server-rendered HTML.
// Production systems should use httpOnly cookies + CSRF tokens instead.

const TOKEN_KEY = 'igp_token';

function saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

function logout() {
    clearToken();
    window.location.href = '/';
}

// Redirect to /login if no token is present. Returns the token otherwise.
function requireToken() {
    const token = getToken();
    if (!token) {
        window.location.href = '/login';
        return null;
    }
    return token;
}

// Fetch wrapper: adds Bearer header, sends/receives JSON, throws on non-2xx.
// Returns { ok, status, data } so callers can inspect errors without try/catch noise.
async function apiFetch(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (options.body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(path, { ...options, headers });
    let data = null;
    try {
        data = await res.json();
    } catch {
        // Non-JSON response (shouldn't happen for our API) — leave data null
    }
    return { ok: res.ok, status: res.status, data };
}

// Replace the nav contents based on token presence.
// We use textContent for all dynamic text to avoid XSS.
function renderNav() {
    const nav = document.getElementById('site-nav');
    if (!nav) return;

    nav.replaceChildren(); // clear defaults from header.ejs

    const token = getToken();
    const link = (href, text) => {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = text;
        return a;
    };

    if (!token) {
        nav.append(link('/login', 'Login'), link('/register', 'Register'));
        return;
    }

    nav.append(link('/dashboard', 'Dashboard'), link('/app/my-questions', 'My Questions'));
    nav.append(link('/scholar', 'Scholar'));

    const logoutBtn = document.createElement('button');
    logoutBtn.type = 'button';
    logoutBtn.textContent = 'Logout';
    logoutBtn.className = 'nav-logout';
    logoutBtn.addEventListener('click', logout);
    nav.append(logoutBtn);
}

// Run on every page load (safe: nav may not exist on some pages, guarded above)
document.addEventListener('DOMContentLoaded', renderNav);