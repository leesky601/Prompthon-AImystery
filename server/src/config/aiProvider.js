import dotenv from 'dotenv';

dotenv.config();

class AIProviderConfig {
  constructor() {
    // Determine which AI provider to use
    this.provider = process.env.AI_PROVIDER || 'azure'; // 'azure' or 'exaone'
    this.enableStreaming = process.env.ENABLE_STREAMING === 'true';
    this.enableFallback = process.env.ENABLE_FALLBACK !== 'false'; // Default true
    
    // Validate configuration
    this.validateConfig();
  }

  validateConfig() {
    const validProviders = ['azure', 'exaone'];
    
    if (!validProviders.includes(this.provider)) {
      console.warn(`⚠️  Invalid AI_PROVIDER "${this.provider}", defaulting to "azure"`);
      this.provider = 'azure';
    }

    // Check if required environment variables are set for each provider
    if (this.provider === 'exaone') {
      if (!process.env.FRIENDLI_TOKEN) {
        console.warn('⚠️  FRIENDLI_TOKEN not set for Exaone provider');
        if (this.enableFallback) {
          console.warn('⚠️  Falling back to Azure OpenAI');
          this.provider = 'azure';
        }
      }
    }

    if (this.provider === 'azure') {
      if (!process.env.AZURE_OPENAI_API_KEY || !process.env.AZURE_OPENAI_ENDPOINT) {
        console.warn('⚠️  Azure OpenAI credentials not fully configured');
      }
    }

    console.log(`🤖 AI Provider configured: ${this.provider.toUpperCase()}`);
    console.log(`📡 Streaming ${this.enableStreaming ? 'enabled' : 'disabled'}`);
    console.log(`🔄 Fallback ${this.enableFallback ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get the current AI provider
   */
  getProvider() {
    return this.provider;
  }

  /**
   * Check if streaming is enabled
   */
  isStreamingEnabled() {
    return this.enableStreaming;
  }

  /**
   * Check if fallback is enabled
   */
  isFallbackEnabled() {
    return this.enableFallback;
  }

  /**
   * Switch to fallback provider
   */
  switchToFallback() {
    if (this.provider === 'exaone') {
      this.provider = 'azure';
      console.log('🔄 Switched to Azure OpenAI (fallback)');
      return true;
    }
    return false;
  }

  /**
   * Get configuration summary
   */
  getConfig() {
    return {
      provider: this.provider,
      streaming: this.enableStreaming,
      fallback: this.enableFallback,
      exaone: {
        configured: !!process.env.FRIENDLI_TOKEN,
        model: process.env.EXAONE_MODEL || 'LGAI-EXAONE/EXAONE-4.0.1-32B'
      },
      azure: {
        configured: !!process.env.AZURE_OPENAI_API_KEY && !!process.env.AZURE_OPENAI_ENDPOINT,
        deployment: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4-mini'
      }
    };
  }
}

// Export singleton instance
export default new AIProviderConfig();