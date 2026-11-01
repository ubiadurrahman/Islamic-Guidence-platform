import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Entry point. Mounts <App /> into #root from index.html.
// StrictMode double-invokes effects in development only (not production)
// to catch missing cleanup functions. If a fetch runs twice in the Network
// tab during dev, that's StrictMode working as designed — not a bug.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);