/**
 * Entry point. Loads environment config, imports the configured app,
 * and starts listening on the configured port.
 */
import { port, nodeEnv } from './config/env.js';
import app from './app.js';

app.listen(port, () => {
    console.log(`[server] Running in ${nodeEnv} mode on http://localhost:${port}`);
});