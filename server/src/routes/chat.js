import express from 'express';
import AgentOrchestrator from '../services/AgentOrchestrator.js';
import { validateChatRequest } from '../middleware/validation.js';
import logger from '../utils/logger.js';

const router = express.Router();
const orchestrator = new AgentOrchestrator();

// Initialize chat session
router.post('/init', async (req, res) => {
  try {
    const { productId, userData } = req.body;
    
    // Debug log to check received productId
    logger.info(`Chat init received - productId: ${productId}, type: ${typeof productId}`);
    
    const result = await orchestrator.initializeSession(productId, userData);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    // Store session ID in session
    req.session.chatSessionId = result.sessionId;
    
    res.json({
      success: true,
      sessionId: result.sessionId,
      message: result.message,
      state: result.state
    });
  } catch (error) {
    logger.error('Chat init error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize chat session'
    });
  }
});

// Send message to chatbot
router.post('/message', validateChatRequest, async (req, res) => {
  try {
    const { sessionId, message, messageType = 'text' } = req.body;
    
    // Validate session ID
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const result = await orchestrator.processUserMessage(
      sessionId,
      message,
      messageType
    );
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Chat message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message'
    });
  }
});

// Get session history
router.get('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await orchestrator.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      sessionId,
      conversationHistory: session.conversationHistory,
      state: session.state,
      turnCount: session.turnCount
    });
  } catch (error) {
    logger.error('Get history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve session history'
    });
  }
});

// End chat session
router.post('/end', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const session = await orchestrator.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Save final conversation
    await orchestrator.saveConversation(session);
    
    // Clean up session
    orchestrator.activeSessions.delete(sessionId);
    
    res.json({
      success: true,
      message: 'Chat session ended successfully'
    });
  } catch (error) {
    logger.error('End chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end chat session'
    });
  }
});

// Clean up inactive sessions (admin endpoint)
router.post('/cleanup', async (req, res) => {
  try {
    // Check for admin authorization
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const cleaned = await orchestrator.cleanupInactiveSessions();
    
    res.json({
      success: true,
      message: `Cleaned up ${cleaned} inactive sessions`
    });
  } catch (error) {
    logger.error('Cleanup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup sessions'
    });
  }
});

export default router;