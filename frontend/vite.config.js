import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Vite dev-server config for the React frontend.
//
// - Port 5173 is PINNED (strictPort) so the backend CORS whitelist never drifts.
//   If 5173 is in use, Vite fails loudly instead of silently picking 5174+.
// - /api is proxied to the backend on :3000 for local dev. This mirrors
//   production, where frontend and API are served from the same origin.
//   The backend ALSO has an explicit CORS whitelist for :5173 (added in
//   R1.2 file 5), so browser calls to http://localhost:3000 directly still
//   work when needed for debugging.
// - The proxy rewrites /api/foo -> http://localhost:3000/foo (strips /api),
//   so backend endpoints stay exactly as they are. Backend does not know a
//   proxy exists.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});