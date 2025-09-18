import PurchaseAgent from '../agents/PurchaseAgent.js';
import SubscriptionAgent from '../agents/SubscriptionAgent.js';
import ModeratorAgent from '../agents/ModeratorAgent.js';
import AzureStorageConnector from '../connectors/azureStorage.js';
import { v4 as uuidv4 } from 'uuid';

class AgentOrchestrator {
  constructor() {
    this.purchaseAgent = new PurchaseAgent();
    this.subscriptionAgent = new SubscriptionAgent();
    this.moderatorAgent = new ModeratorAgent();
    this.storageConnector = new AzureStorageConnector();
    this.activeSessions = new Map();
  }

  // Initialize a new conversation session
  async initializeSession(productId = null, userData = {}) {
    try {
      const sessionId = uuidv4();
      const conversationId = uuidv4();
      
      const session = {
        sessionId,
        conversationId,
        productId,
        userData,
        conversationHistory: [],
        state: 'welcome', // welcome, initial_debate, ongoing_debate, conclusion
        turnCount: 0,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };

      // Store session in memory
      this.activeSessions.set(sessionId, session);

      // Store session in Azure Storage
      await this.storageConnector.createSession(sessionId, {
        productId,
        ...userData
      });

      // Generate welcome message
      const welcomeMessage = await this.moderatorAgent.generateWelcomeMessage();
      session.conversationHistory.push(welcomeMessage);

      return {
        success: true,
        sessionId,
        message: welcomeMessage,
        state: session.state
      };
    } catch (error) {
      console.error('Session initialization error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Process user message and orchestrate agent responses
  async processUserMessage(sessionId, userMessage, messageType = 'text') {
    try {
      const session = await this.getSession(sessionId);
      
      if (!session) {
        throw new Error('Session not found');
      }

      // Update session activity
      session.lastActivity = new Date().toISOString();
      
      // Add user message to history
      if (userMessage && messageType === 'text') {
        session.conversationHistory.push({
          role: 'user',
          content: userMessage,
          timestamp: new Date().toISOString()
        });
      }

      // Determine next action based on state and message
      let response;
      
      switch (session.state) {
        case 'welcome':
          if (userMessage === '시작하자' || messageType === 'start') {
            response = await this.startInitialDebate(session);
            session.state = 'initial_debate';
          } else {
            response = {
              success: true,
              message: {
                agent: '안내봇',
                content: '토론을 시작하려면 "시작하자" 버튼을 눌러주세요!',
                quickResponses: ['시작하자']
              }
            };
          }
          break;

        case 'initial_debate':
          // After initial arguments, move to ongoing debate
          session.state = 'ongoing_debate';
          response = await this.handleOngoingDebate(session, userMessage);
          break;

        case 'ongoing_debate':
          if (userMessage === '이제 결론을 내줘') {
            response = await this.generateConclusion(session);
            session.state = 'conclusion';
          } else {
            response = await this.handleOngoingDebate(session, userMessage);
          }
          break;

        case 'conclusion':
          response = {
            success: true,
            message: {
              agent: '안내봇',
              content: '대화가 종료되었습니다. 새로운 상담을 원하시면 페이지를 새로고침해주세요.',
              conversationEnded: true
            }
          };
          break;

        default:
          response = await this.handleOngoingDebate(session, userMessage);
      }

      // Update turn count
      session.turnCount++;

      // Save conversation to storage periodically
      if (session.turnCount % 5 === 0) {
        await this.saveConversation(session);
      }

      // Update session in memory
      this.activeSessions.set(sessionId, session);

      return response;
    } catch (error) {
      console.error('Process message error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Start initial debate between purchase and subscription agents
  async startInitialDebate(session) {
    try {
      const responses = [];
      
      // Generate purchase agent's initial argument
      const purchaseArgument = await this.purchaseAgent.generateInitialArgument(
        session.productId
      );
      session.conversationHistory.push(purchaseArgument);
      responses.push(purchaseArgument);

      // Generate subscription agent's initial argument (independent)
      const subscriptionArgument = await this.subscriptionAgent.generateInitialArgument(
        session.productId
      );
      session.conversationHistory.push(subscriptionArgument);
      responses.push(subscriptionArgument);

      // Generate moderator's summary and question
      const moderatorSummary = await this.moderatorAgent.summarizeAndQuestion({
        productId: session.productId,
        conversationHistory: session.conversationHistory
      });
      session.conversationHistory.push(moderatorSummary);
      responses.push(moderatorSummary);

      return {
        success: true,
        messages: responses,
        state: 'ongoing_debate'
      };
    } catch (error) {
      console.error('Initial debate error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Handle ongoing debate with user interaction
  async handleOngoingDebate(session, userMessage) {
    try {
      const responses = [];
      const context = {
        productId: session.productId,
        conversationHistory: session.conversationHistory,
        userData: session.userData
      };

      // Purchase agent responds to user input
      const purchaseResponse = await this.purchaseAgent.processMessage(
        context,
        userMessage
      );
      session.conversationHistory.push(purchaseResponse);
      responses.push(purchaseResponse);

      // Subscription agent provides counter-argument
      const subscriptionRebuttal = await this.subscriptionAgent.generateRebuttal(
        context,
        purchaseResponse.content
      );
      session.conversationHistory.push(subscriptionRebuttal);
      responses.push(subscriptionRebuttal);

      // Moderator summarizes and asks next question
      const moderatorSummary = await this.moderatorAgent.summarizeAndQuestion(context);
      session.conversationHistory.push(moderatorSummary);
      responses.push(moderatorSummary);

      return {
        success: true,
        messages: responses,
        state: 'ongoing_debate'
      };
    } catch (error) {
      console.error('Ongoing debate error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate final conclusion
  async generateConclusion(session) {
    try {
      const context = {
        productId: session.productId,
        conversationHistory: session.conversationHistory,
        userData: session.userData
      };

      const conclusion = await this.moderatorAgent.generateConclusion(context);
      session.conversationHistory.push(conclusion);

      // Save final conversation
      await this.saveConversation(session);
      
      // Archive conversation to blob storage
      await this.storageConnector.archiveConversation(
        session.sessionId,
        session.conversationHistory
      );

      return {
        success: true,
        message: conclusion,
        state: 'conclusion',
        conversationEnded: true
      };
    } catch (error) {
      console.error('Generate conclusion error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get session from memory or storage
  async getSession(sessionId) {
    // Check memory first
    if (this.activeSessions.has(sessionId)) {
      return this.activeSessions.get(sessionId);
    }

    // Try to load from storage
    const storageResult = await this.storageConnector.getSession(sessionId);
    if (storageResult.success) {
      const conversationResult = await this.storageConnector.getConversationHistory(sessionId);
      
      const session = {
        sessionId,
        ...storageResult.session,
        conversationHistory: conversationResult.success ? 
          conversationResult.conversations.flatMap(c => c.messages) : []
      };
      
      this.activeSessions.set(sessionId, session);
      return session;
    }

    return null;
  }

  // Save conversation to storage
  async saveConversation(session) {
    try {
      const conversationId = uuidv4();
      await this.storageConnector.saveConversation(
        session.sessionId,
        conversationId,
        session.conversationHistory
      );
      
      await this.storageConnector.updateSession(session.sessionId, {
        lastActivity: session.lastActivity,
        turnCount: session.turnCount,
        state: session.state
      });
    } catch (error) {
      console.error('Save conversation error:', error);
    }
  }

  // Clean up inactive sessions
  async cleanupInactiveSessions(maxInactivityMinutes = 30) {
    const now = new Date();
    const toRemove = [];

    for (const [sessionId, session] of this.activeSessions) {
      const lastActivity = new Date(session.lastActivity);
      const inactivityMinutes = (now - lastActivity) / (1000 * 60);
      
      if (inactivityMinutes > maxInactivityMinutes) {
        toRemove.push(sessionId);
        await this.saveConversation(session);
      }
    }

    toRemove.forEach(sessionId => this.activeSessions.delete(sessionId));
    
    return toRemove.length;
  }
}

export default AgentOrchestrator;