import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

class AzureOpenAIConnector {
  constructor() {
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
  }

  async generateResponse(messages, systemPrompt, temperature = 0.7, maxTokens = 1000) {
    try {
      const fullMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];

      const response = await this.client.chat.completions.create({
        model: 'gpt-4', // This is ignored by Azure, deployment name is used in URL
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
      console.error('Azure OpenAI API Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generateWithFunctions(messages, systemPrompt, functions, temperature = 0.7) {
    try {
      const fullMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];

      const response = await this.client.chat.completions.create({
        model: 'gpt-4', // This is ignored by Azure, deployment name is used in URL
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
      console.error('Azure OpenAI API Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default AzureOpenAIConnector;