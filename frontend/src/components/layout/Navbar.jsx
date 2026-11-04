import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../ui/Button.jsx';

// Navbar — top-level site navigation.
//
// The theme toggle cycles light → dark → system → light. Icons:
//   light  → sun
//   dark   → moon
//   system → half-circle (auto)
//
// Auth section (right side): when logged in, shows the user's name and a
// logout button. Logging out clears the session via AuthContext.logout()
// and navigates to '/' so the user lands on the public home page and the
// back button doesn't return to a protected page.

const THEME_LABELS = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

const NEXT_THEME = {
  light: 'dark',
  dark: 'system',
  system: 'light',
};

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 000 18z" fill="currentColor" />
    </svg>
  );
}

const ICONS = {
  light: SunIcon,
  dark: MoonIcon,
  system: SystemIcon,
};

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const Icon = ICONS[theme] || ICONS.system;
  const nextTheme = NEXT_THEME[theme] || 'light';

  function handleLogout() {
    logout();
    navigate('/', { replace: true });
  }

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-semibold text-text">
          Islamic Guidance
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `text-sm ${isActive ? 'text-accent' : 'text-muted hover:text-text'} transition-colors`
                }
              >
                Dashboard
              </NavLink>
              <span className="text-sm text-muted">{user.fullName}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `text-sm ${isActive ? 'text-accent' : 'text-muted hover:text-text'} transition-colors`
                }
              >
                Log in
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `text-sm ${isActive ? 'text-accent' : 'text-muted hover:text-text'} transition-colors`
                }
              >
                Register
              </NavLink>
            </>
          )}

          <button
            type="button"
            onClick={() => setTheme(nextTheme)}
            aria-label={`Theme: ${THEME_LABELS[theme] || 'System'} (click to switch to ${THEME_LABELS[nextTheme]})`}
            title={`Theme: ${THEME_LABELS[theme] || 'System'}`}
            className="rounded-base border border-border bg-bg p-2 text-text transition-colors hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Icon />
          </button>
        </nav>
      </div>
    </header>
  );
}