import { AzureOpenAI } from '@azure/openai';
import dotenv from 'dotenv';

dotenv.config();

class AzureOpenAIConnector {
  constructor() {
    this.client = new AzureOpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-01',
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4-mini'
    });
    this.deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4-mini';
  }

  async generateResponse(messages, systemPrompt, temperature = 0.7, maxTokens = 1000) {
    try {
      const fullMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];

      const response = await this.client.chat.completions.create({
        messages: fullMessages,
        model: this.deploymentName,
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
        messages: fullMessages,
        model: this.deploymentName,
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