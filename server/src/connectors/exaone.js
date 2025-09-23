import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

class ExaoneConnector {
  constructor() {
    this.token = process.env.FRIENDLI_TOKEN;
    this.model = process.env.EXAONE_MODEL || 'LGAI-EXAONE/EXAONE-4.0.1-32B';
    this.maxTokens = parseInt(process.env.EXAONE_MAX_TOKENS || '1000');
    this.temperature = parseFloat(process.env.EXAONE_TEMPERATURE || '0.7');
    this.timeout = parseInt(process.env.EXAONE_TIMEOUT || '30000');
    
    if (this.token && this.token !== 'your_friendli_token_here') {
      // Exaone uses OpenAI-compatible API
      this.client = new OpenAI({
        baseURL: 'https://api.friendli.ai/serverless/v1',
        apiKey: this.token,
        timeout: this.timeout,
      });
      
      this.enabled = true;
      console.log('✅ Exaone connector initialized successfully');
    } else {
      this.enabled = false;
      this.client = null;
      console.warn('⚠️  Exaone not configured - FRIENDLI_TOKEN missing');
    }
  }

  /**
   * Format messages with Azure Search context
   */
  formatMessagesWithContext(messages, searchResults) {
    if (!searchResults || searchResults.length === 0) {
      return messages;
    }

    // Build context from search results
    const context = searchResults
      .slice(0, 3) // Limit to top 3 results to manage token usage
      .map(result => {
        const doc = result.document;
        return `제품: ${doc.product_name || 'Unknown'}
설명: ${doc.description || ''}
구매가격: ${doc.purchase_price || '정보 없음'}
구독가격(3년): ${doc.subscription_price_3y || '정보 없음'}
구독 장점: ${doc.subscription_benefits || '정보 없음'}`;
      })
      .join('\n---\n');

    // Add context as a system message
    const contextMessage = {
      role: 'system',
      content: `다음은 관련 제품 정보입니다. 이 정보를 참고하여 답변하세요:\n\n${context}`
    };

    // Insert context message after the main system prompt
    const enhancedMessages = [...messages];
    if (enhancedMessages[0]?.role === 'system') {
      enhancedMessages.splice(1, 0, contextMessage);
    } else {
      enhancedMessages.unshift(contextMessage);
    }

    return enhancedMessages;
  }

  /**
   * Generate response using Exaone
   */
  async generateResponse(messages, systemPrompt, temperature = null, maxTokens = null) {
    try {
      if (!this.enabled) {
        return {
          success: false,
          error: 'Exaone not configured'
        };
      }

      const fullMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: fullMessages,
        temperature: temperature || this.temperature,
        max_tokens: maxTokens || this.maxTokens,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      return {
        success: true,
        content: response.choices[0].message.content,
        usage: response.usage
      };
    } catch (error) {
      console.error('Exaone API Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate streaming response using Exaone
   */
  async generateStreamResponse(messages, systemPrompt, onChunk, temperature = null, maxTokens = null) {
    try {
      if (!this.enabled) {
        throw new Error('Exaone not configured');
      }

      const fullMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];

      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: fullMessages,
        temperature: temperature || this.temperature,
        max_tokens: maxTokens || this.maxTokens,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: true, // Enable streaming
      });

      let fullContent = '';
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullContent += content;
          // Call the onChunk callback with each piece of content
          if (onChunk) {
            onChunk(content);
          }
        }
      }

      return {
        success: true,
        content: fullContent
      };
    } catch (error) {
      console.error('Exaone Stream API Error:', error);
      throw error;
    }
  }

  /**
   * Generate response with Azure Search integration
   */
  async generateResponseWithSearch(messages, systemPrompt, searchResults, temperature = null) {
    try {
      if (!this.enabled) {
        return {
          success: false,
          error: 'Exaone not configured'
        };
      }

      // Format messages with search context
      const enhancedMessages = this.formatMessagesWithContext(messages, searchResults);
      
      // Generate response with enhanced context
      return await this.generateResponse(
        enhancedMessages,
        systemPrompt,
        temperature
      );
    } catch (error) {
      console.error('Exaone API Error with Search:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if Exaone is available and configured
   */
  isAvailable() {
    return this.enabled;
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return {
      enabled: this.enabled,
      model: this.model,
      maxTokens: this.maxTokens,
      temperature: this.temperature,
      timeout: this.timeout
    };
  }
}

export default ExaoneConnector;