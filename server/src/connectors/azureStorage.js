import { TableClient, TableServiceClient } from '@azure/data-tables';
import { BlobServiceClient } from '@azure/storage-blob';
import { QueueServiceClient } from '@azure/storage-queue';
import dotenv from 'dotenv';

dotenv.config();

class AzureStorageConnector {
  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    
    // Initialize Table Storage
    this.tableServiceClient = TableServiceClient.fromConnectionString(connectionString);
    this.sessionTable = TableClient.fromConnectionString(connectionString, 'sessions');
    this.conversationTable = TableClient.fromConnectionString(connectionString, 'conversations');
    
    // Initialize Blob Storage
    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    this.conversationContainer = this.blobServiceClient.getContainerClient('conversation-logs');
    
    // Initialize Queue Storage
    this.queueServiceClient = QueueServiceClient.fromConnectionString(connectionString);
    this.taskQueue = this.queueServiceClient.getQueueClient('chatbot-tasks');
    
    this.initializeStorage();
  }

  async initializeStorage() {
    try {
      // Create tables if they don't exist
      await this.tableServiceClient.createTable('sessions').catch(() => {});
      await this.tableServiceClient.createTable('conversations').catch(() => {});
      
      // Create blob container if it doesn't exist
      await this.conversationContainer.createIfNotExists({ access: 'container' });
      
      // Create queue if it doesn't exist
      await this.taskQueue.createIfNotExists();
    } catch (error) {
      console.error('Storage initialization error:', error);
    }
  }

  // Session Management
  async createSession(sessionId, userData) {
    try {
      const entity = {
        partitionKey: 'session',
        rowKey: sessionId,
        userData: JSON.stringify(userData),
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };
      
      await this.sessionTable.createEntity(entity);
      return { success: true, sessionId };
    } catch (error) {
      console.error('Create session error:', error);
      return { success: false, error: error.message };
    }
  }

  async getSession(sessionId) {
    try {
      const entity = await this.sessionTable.getEntity('session', sessionId);
      return {
        success: true,
        session: {
          ...entity,
          userData: JSON.parse(entity.userData || '{}')
        }
      };
    } catch (error) {
      console.error('Get session error:', error);
      return { success: false, error: error.message };
    }
  }

  async updateSession(sessionId, updates) {
    try {
      const entity = await this.sessionTable.getEntity('session', sessionId);
      const updatedEntity = {
        ...entity,
        ...updates,
        lastActivity: new Date().toISOString()
      };
      
      if (updates.userData) {
        updatedEntity.userData = JSON.stringify(updates.userData);
      }
      
      await this.sessionTable.updateEntity(updatedEntity, 'Merge');
      return { success: true };
    } catch (error) {
      console.error('Update session error:', error);
      return { success: false, error: error.message };
    }
  }

  // Conversation History
  async saveConversation(sessionId, conversationId, messages) {
    try {
      const entity = {
        partitionKey: sessionId,
        rowKey: conversationId,
        messages: JSON.stringify(messages),
        timestamp: new Date().toISOString()
      };
      
      await this.conversationTable.createEntity(entity);
      return { success: true };
    } catch (error) {
      console.error('Save conversation error:', error);
      return { success: false, error: error.message };
    }
  }

  async getConversationHistory(sessionId) {
    try {
      const queryOptions = {
        filter: `PartitionKey eq '${sessionId}'`
      };
      
      const entities = [];
      const iterator = this.conversationTable.listEntities({ queryOptions });
      
      for await (const entity of iterator) {
        entities.push({
          ...entity,
          messages: JSON.parse(entity.messages || '[]')
        });
      }
      
      return {
        success: true,
        conversations: entities.sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        )
      };
    } catch (error) {
      console.error('Get conversation history error:', error);
      return { success: false, error: error.message };
    }
  }

  // Blob Storage for Large Logs
  async archiveConversation(sessionId, conversationData) {
    try {
      const blobName = `${sessionId}/${Date.now()}.json`;
      const blockBlobClient = this.conversationContainer.getBlockBlobClient(blobName);
      
      const data = JSON.stringify(conversationData, null, 2);
      await blockBlobClient.upload(data, data.length, {
        blobHTTPHeaders: { blobContentType: 'application/json' }
      });
      
      return { success: true, blobUrl: blockBlobClient.url };
    } catch (error) {
      console.error('Archive conversation error:', error);
      return { success: false, error: error.message };
    }
  }

  // Queue for Async Tasks
  async queueTask(taskData) {
    try {
      const message = Buffer.from(JSON.stringify(taskData)).toString('base64');
      await this.taskQueue.sendMessage(message);
      return { success: true };
    } catch (error) {
      console.error('Queue task error:', error);
      return { success: false, error: error.message };
    }
  }

  async getNextTask() {
    try {
      const response = await this.taskQueue.receiveMessages({ numberOfMessages: 1 });
      
      if (response.receivedMessageItems.length > 0) {
        const message = response.receivedMessageItems[0];
        const taskData = JSON.parse(
          Buffer.from(message.messageText, 'base64').toString('utf-8')
        );
        
        // Delete the message from the queue
        await this.taskQueue.deleteMessage(message.messageId, message.popReceipt);
        
        return { success: true, task: taskData };
      }
      
      return { success: true, task: null };
    } catch (error) {
      console.error('Get next task error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default AzureStorageConnector;