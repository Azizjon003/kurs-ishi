import { Router, Request, Response } from 'express';
import { openApiSpec } from '../docs/openapi.js';

export const docsRouter = Router();

/**
 * GET /docs
 * API documentation homepage
 */
docsRouter.get('/', (req: Request, res: Response) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Academic Paper Generator API - Documentation</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 40px 20px;
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          padding: 40px;
        }
        h1 {
          color: #667eea;
          margin-bottom: 10px;
          font-size: 2.5em;
        }
        .subtitle {
          color: #666;
          margin-bottom: 30px;
          font-size: 1.1em;
        }
        .section {
          margin: 30px 0;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }
        h2 {
          color: #667eea;
          margin-bottom: 15px;
        }
        .link-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }
        .link-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          border: 2px solid #e1e8ed;
          text-decoration: none;
          color: #333;
          transition: all 0.3s ease;
        }
        .link-card:hover {
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }
        .link-card h3 {
          color: #667eea;
          margin-bottom: 8px;
        }
        .link-card p {
          color: #666;
          font-size: 0.9em;
        }
        code {
          background: #f1f3f4;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
        .endpoint {
          background: white;
          padding: 15px;
          margin: 10px 0;
          border-radius: 6px;
          border-left: 4px solid #764ba2;
        }
        .method {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 0.85em;
          margin-right: 10px;
        }
        .method.post { background: #10b981; color: white; }
        .method.get { background: #3b82f6; color: white; }
        .method.delete { background: #ef4444; color: white; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📚 Academic Paper Generator API</h1>
        <p class="subtitle">Автоматически создавайте академические курсовые работы с помощью REST API</p>

        <div class="section">
          <h2>🚀 Quick Links</h2>
          <div class="link-grid">
            <a href="/docs/openapi" class="link-card">
              <h3>📄 OpenAPI Spec</h3>
              <p>View the complete OpenAPI 3.0 specification in JSON format</p>
            </a>
            <a href="/docs/swagger" class="link-card">
              <h3>🔍 Swagger UI</h3>
              <p>Interactive API documentation and testing interface</p>
            </a>
            <a href="/health" class="link-card">
              <h3>💚 Health Check</h3>
              <p>Check API health status and system information</p>
            </a>
            <a href="https://github.com/yourusername/academic-paper-api" class="link-card">
              <h3>💻 GitHub</h3>
              <p>View source code and contribute to the project</p>
            </a>
          </div>
        </div>

        <div class="section">
          <h2>📡 Main Endpoints</h2>

          <div class="endpoint">
            <span class="method post">POST</span>
            <code>/api/v1/workflow</code>
            <p>Create a new academic paper generation job</p>
          </div>

          <div class="endpoint">
            <span class="method get">GET</span>
            <code>/api/v1/workflow/:jobId</code>
            <p>Get status and result of a specific job</p>
          </div>

          <div class="endpoint">
            <span class="method get">GET</span>
            <code>/api/v1/workflow/:jobId/download</code>
            <p>Download the generated Word document</p>
          </div>

          <div class="endpoint">
            <span class="method get">GET</span>
            <code>/api/v1/workflow</code>
            <p>List all jobs with pagination</p>
          </div>

          <div class="endpoint">
            <span class="method delete">DELETE</span>
            <code>/api/v1/workflow/:jobId</code>
            <p>Delete a completed or failed job</p>
          </div>
        </div>

        <div class="section">
          <h2>🔑 Authentication</h2>
          <p>API key authentication is optional. If enabled, include your API key in the request header:</p>
          <pre style="background: white; padding: 15px; border-radius: 6px; margin-top: 10px;"><code>X-API-Key: your_api_key_here</code></pre>
        </div>

        <div class="section">
          <h2>📖 Example Usage</h2>
          <pre style="background: white; padding: 15px; border-radius: 6px; overflow-x: auto;"><code>curl -X POST ${baseUrl}/api/v1/workflow \\
  -H "Content-Type: application/json" \\
  -d '{
    "topic": "Matematik kutilma va dispersiya",
    "language": "uzbek",
    "pageCount": 30,
    "studentName": "Alisher Navoiy"
  }'</code></pre>
        </div>
      </div>
    </body>
    </html>
  `);
});

/**
 * GET /docs/openapi
 * OpenAPI specification in JSON format
 */
docsRouter.get('/openapi', (req: Request, res: Response) => {
  res.json(openApiSpec);
});

/**
 * GET /docs/swagger
 * Swagger UI for interactive API documentation
 */
docsRouter.get('/swagger', (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Swagger UI - Academic Paper Generator API</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
      <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            url: '/docs/openapi',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            layout: "StandaloneLayout"
          });
        };
      </script>
    </body>
    </html>
  `);
});
