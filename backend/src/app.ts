import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';
import { config } from './config';

export const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Allow frontend dev origin and previews
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(requestLogger);

// API Documentation / root welcome
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to DealPulse AI - Intelligent B2B Sales & Revenue Workflow API',
    version: '1.0.0',
    documentation: {
      deals: '/api/deals',
      analytics: '/api/analytics/overview',
      workflows: '/api/workflows',
      aiCopilot: '/api/ai/copilot',
      health: '/api/health',
    },
  });
});

// Mount API routes
app.use('/api', routes);

// Centralized error handler
app.use(errorHandler);
