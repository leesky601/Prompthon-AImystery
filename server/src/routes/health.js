import express from 'express';

const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Liveness probe
router.get('/live', (req, res) => {
  res.status(200).send('OK');
});

// Readiness probe
router.get('/ready', async (req, res) => {
  try {
    // Check if all required environment variables are set
    const requiredEnvVars = [
      'AZURE_OPENAI_API_KEY',
      'AZURE_OPENAI_ENDPOINT',
      'AZURE_SEARCH_API_KEY',
      'AZURE_SEARCH_ENDPOINT',
      'AZURE_STORAGE_CONNECTION_STRING'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      return res.status(503).json({
        success: false,
        status: 'not ready',
        error: `Missing environment variables: ${missingVars.join(', ')}`
      });
    }

    res.json({
      success: true,
      status: 'ready'
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'not ready',
      error: error.message
    });
  }
});

export default router;