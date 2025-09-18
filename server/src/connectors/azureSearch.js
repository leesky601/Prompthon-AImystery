import { SearchClient, AzureKeyCredential } from '@azure/search-documents';
import dotenv from 'dotenv';

dotenv.config();

class AzureSearchConnector {
  constructor() {
    this.endpoint = process.env.AZURE_SEARCH_ENDPOINT;
    this.apiKey = process.env.AZURE_SEARCH_API_KEY;
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
  }

  async searchProductInfo(query, filters = {}) {
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