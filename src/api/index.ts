/**
 * Academic Paper Generator API
 *
 * Main entry point for the REST API server
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

import { APIServer } from './server.js';

const server = new APIServer();
server.start();

export { APIServer };
