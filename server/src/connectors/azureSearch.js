import { SearchClient, AzureKeyCredential } from '@azure/search-documents';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      // Load products from local JSON file
      try {
        const productsPath = path.join(__dirname, '../../../src/data/detailedProducts.json');
        const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
        
        // Find product by ID
        const product = productsData.products.find(p => p.id === productId);
        
        if (product) {
          // Transform to expected format
          return {
            success: true,
            document: {
              product_id: product.id,
              product_name: product['이름'],
              description: product['설명'],
              purchase_price: product['구매가격정보'],
              subscription_price_3y: product['구독가격_3년'],
              subscription_price_4y: product['구독가격_4년'],
              subscription_price_5y: product['구독가격_5년'],
              subscription_price_6y: product['구독가격_6년'],
              subscription_benefits: product['구독장점'] ? product['구독장점'].join(', ') : '',
              care_service_frequency: product['케어서비스빈도'],
              care_service_types: product['케어서비스유형'],
              care_service_description: product['케어서비스설명'],
              care_service_price: product['케어서비스가격정보'],
              image: product.image
            }
          };
        } else {
          console.warn(`Product with ID ${productId} not found in local data`);
          return {
            success: true,
            document: null
          };
        }
      } catch (error) {
        console.error('Error loading product from local file:', error);
        return {
          success: false,
          error: error.message
        };
      }
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