import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

// Entry point. Mounts <App /> into #root from index.html.
//
// ThemeProvider wraps everything — theme applies to all content, including
// unauthenticated pages (login, register). AuthProvider is INSIDE the router
// (in App.jsx) because it needs useNavigate, which only works inside a
// Router context.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);