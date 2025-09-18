import { SearchClient, AzureKeyCredential } from '@azure/search-documents';
import dotenv from 'dotenv';

dotenv.config();

class AzureSearchConnector {
  constructor() {
    this.endpoint = process.env.AZURE_SEARCH_ENDPOINT;
    this.apiKey = process.env.AZURE_SEARCH_API_KEY;
    
    // Check if Azure Search is configured
    if (this.apiKey && this.apiKey !== 'your_azure_search_api_key_here' && this.endpoint && this.endpoint !== 'https://your-search-service.search.windows.net') {
      this.credential = new AzureKeyCredential(this.apiKey);
      
      // Initialize search clients for different indexes
      this.productInfoClient = new SearchClient(
        this.endpoint,
        'product-info-index',
        this.credential
      );
      
      this.purchaseInfoClient = new SearchClient(
        this.endpoint,
        'purchase-info-index',
        this.credential
      );
      
      this.subscriptionBenefitsClient = new SearchClient(
        this.endpoint,
        'subscription-benefits-index',
        this.credential
      );
      
      this.mockMode = false;
    } else {
      console.warn('⚠️  Azure Search not configured - using mock mode');
      this.mockMode = true;
    }
  }

  async searchProductInfo(query, filters = {}) {
    if (this.mockMode) {
      return {
        success: true,
        results: [],
        count: 0
      };
    }
    
    try {
      const searchOptions = {
        searchMode: 'all',
        queryType: 'full',
        top: 10,
        includeTotalCount: true,
        ...filters
      };

      const searchResults = await this.productInfoClient.search(query, searchOptions);
      const results = [];
      
      for await (const result of searchResults.results) {
        results.push({
          score: result.score,
          document: result.document
        });
      }

      return {
        success: true,
        results,
        count: searchResults.count
      };
    } catch (error) {
      console.error('Azure Search Error (Product Info):', error);
      return {
        success: false,
        error: error.message,
        results: []
      };
    }
  }

  async searchPurchaseInfo(query, filters = {}) {
    if (this.mockMode) {
      return {
        success: true,
        results: [],
        count: 0
      };
    }
    
    try {
      const searchOptions = {
        searchMode: 'all',
        queryType: 'full',
        top: 10,
        includeTotalCount: true,
        ...filters
      };

      const searchResults = await this.purchaseInfoClient.search(query, searchOptions);
      const results = [];
      
      for await (const result of searchResults.results) {
        results.push({
          score: result.score,
          document: result.document
        });
      }

      return {
        success: true,
        results,
        count: searchResults.count
      };
    } catch (error) {
      console.error('Azure Search Error (Purchase Info):', error);
      return {
        success: false,
        error: error.message,
        results: []
      };
    }
  }

  async searchSubscriptionBenefits(query, filters = {}) {
    if (this.mockMode) {
      return {
        success: true,
        results: [],
        count: 0
      };
    }
    
    try {
      const searchOptions = {
        searchMode: 'all',
        queryType: 'full',
        top: 10,
        includeTotalCount: true,
        ...filters
      };

      const searchResults = await this.subscriptionBenefitsClient.search(query, searchOptions);
      const results = [];
      
      for await (const result of searchResults.results) {
        results.push({
          score: result.score,
          document: result.document
        });
      }

      return {
        success: true,
        results,
        count: searchResults.count
      };
    } catch (error) {
      console.error('Azure Search Error (Subscription Benefits):', error);
      return {
        success: false,
        error: error.message,
        results: []
      };
    }
  }

  async getProductById(productId) {
    if (this.mockMode) {
      return {
        success: true,
        document: null
      };
    }
    
    try {
      const result = await this.productInfoClient.getDocument(productId);
      return {
        success: true,
        document: result
      };
    } catch (error) {
      console.error('Azure Search Error (Get Product):', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default AzureSearchConnector;