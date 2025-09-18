import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

class AzureOpenAIConnector {
  constructor() {
    // Check if we should use Azure OpenAI or regular OpenAI
    const useAzure = process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT;
    
    if (useAzure) {
      // Use Azure OpenAI
      const apiKey = process.env.AZURE_OPENAI_API_KEY;
      const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
      const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-01';
      const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4-mini';
      
      // Azure OpenAI uses a different base URL format
      const baseURL = `${endpoint}/openai/deployments/${deployment}`;
      
      this.client = new OpenAI({
        apiKey: apiKey,
        baseURL: baseURL,
        defaultQuery: { 'api-version': apiVersion },
        defaultHeaders: {
          'api-key': apiKey,
        },
      });
      
      this.deploymentName = deployment;
      this.isAzure = true;
    } else if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      // Use regular OpenAI
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      
      this.deploymentName = 'gpt-3.5-turbo';
      this.isAzure = false;
    } else {
      // Mock mode for development without API keys
      console.warn('⚠️  Running in MOCK MODE - No OpenAI API key configured');
      console.warn('⚠️  Chat responses will be simulated');
      this.client = null;
      this.deploymentName = 'mock';
      this.isAzure = false;
      this.mockMode = true;
    }
  }

  async generateResponse(messages, systemPrompt, temperature = 0.7, maxTokens = 1000) {
    try {
      // Mock mode for development
      if (this.mockMode) {
        return {
          success: true,
          content: "안녕하세요! LG전자 챗봇입니다. 현재 개발 모드로 실행 중입니다. 실제 API 키를 설정하시면 정상적인 응답을 받으실 수 있습니다.",
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
        };
      }

      const fullMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];

      const model = this.isAzure ? 'gpt-4' : this.deploymentName;
      
      const response = await this.client.chat.completions.create({
        model: model, // This is ignored by Azure, deployment name is used in URL
        messages: fullMessages,
        temperature,
        max_tokens: maxTokens,
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
      console.error('OpenAI API Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generateWithFunctions(messages, systemPrompt, functions, temperature = 0.7) {
    try {
      // Mock mode for development
      if (this.mockMode) {
        return {
          success: true,
          content: {
            role: 'assistant',
            content: "LG전자 제품에 대해 궁금하신 점을 말씀해 주세요. (개발 모드)"
          },
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
        };
      }

      const fullMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];

      const model = this.isAzure ? 'gpt-4' : this.deploymentName;

      const response = await this.client.chat.completions.create({
        model: model, // This is ignored by Azure, deployment name is used in URL
        messages: fullMessages,
        temperature,
        functions,
        function_call: 'auto'
      });

      return {
        success: true,
        content: response.choices[0].message,
        usage: response.usage
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default AzureOpenAIConnector;