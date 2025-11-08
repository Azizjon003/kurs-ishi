/**
 * Academic Paper Generator API
 *
 * Main entry point for the REST API server
 */

import { APIServer } from './server.js';

const server = new APIServer();
server.start();

export { APIServer };
