import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

// Entry point. Mounts <App /> into #root from index.html.
// StrictMode double-invokes effects in development only (not production)
// to catch missing cleanup functions. If a fetch runs twice in the Network
// tab during dev, that's StrictMode working as designed — not a bug.
//
// Provider order: ThemeProvider outside AuthProvider. Both orderings work
// for our current components, but theme should not depend on auth (it
// doesn't), so keeping it outermost makes the dependency direction clear:
// theme is a global UI concern, auth is a session concern.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);