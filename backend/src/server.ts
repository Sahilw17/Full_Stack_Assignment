import { app } from './app';
import { config } from './config';
import { initDatabase } from './database/db';
import { seedInitialData } from './database/seed';

// Initialize DB schema
initDatabase();

// Auto-seed if database is freshly created
seedInitialData();

const server = app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(`🚀 DealPulse AI Backend listening on port ${config.port}`);
  console.log(`🌐 Base URL: http://localhost:${config.port}`);
  console.log(`📡 Health Check: http://localhost:${config.port}/api/health`);
  console.log(`🤖 AI Engine: ${config.geminiApiKey ? 'Google Gemini 2.5/Flash' : 'Intelligent Heuristics Engine (Zero-Key Mode)'}`);
  console.log(`=======================================================`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});
