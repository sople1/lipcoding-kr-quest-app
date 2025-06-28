import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import mentorRoutes from './routes/mentor.js';
import requestRoutes from './routes/request.js';

// Import database (just to initialize it)
import './models/database.js';
import securityMiddleware from './middleware/security.js';

const { rateLimiter, corsOptions } = securityMiddleware;

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize Express application with middleware and routes
 * @returns {Promise<express.Application>} Configured Express app
 */
async function createApp(): Promise<express.Application> {
  const app = express();

  // Initialize database (automatically done in constructor)
  console.log('Database initialized');

  // Security middleware
  app.use(helmet());
  
  // CORS configuration
  app.use(cors(corsOptions));

  // Rate limiting
  app.use(rateLimiter);

  // Body parsing middleware
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Load OpenAPI specification
  let openApiSpec;
  try {
    openApiSpec = YAML.load(path.join(__dirname, '../../.rules/openapi.yaml'));
  } catch (error) {
    console.warn('OpenAPI spec not found, using basic spec');
    openApiSpec = {
      openapi: '3.0.1',
      info: { title: 'Mentor-Mentee API', version: '1.0.0' },
      paths: {}
    };
  }
  
  // Swagger UI setup
  app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(openApiSpec));
  
  // OpenAPI JSON endpoint
  app.get('/openapi.json', (_req, res) => {
    res.json(openApiSpec);
  });

  // Redirect root to Swagger UI
  app.get('/', (_req, res) => {
    res.redirect('/swagger-ui');
  });

  // Temporary health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
  });

  // API routes
  app.use('/api', authRoutes);
  app.use('/api', userRoutes);
  app.use('/api', mentorRoutes);
  app.use('/api', requestRoutes);

  // Error handling middleware
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
  });

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    const app = await createApp();
    const port = process.env.PORT || 8080;

    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
      console.log(`📚 Swagger UI available at http://localhost:${port}/swagger-ui`);
      console.log(`📄 OpenAPI spec available at http://localhost:${port}/openapi.json`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
} else {
  // Always start server for now
  startServer();
}

export { createApp, startServer };
