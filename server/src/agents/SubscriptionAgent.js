import BaseAgent from './BaseAgent.js';

class SubscriptionAgent extends BaseAgent {
  constructor() {
    super('구독봇', 'subscription');
  }

  getSystemPrompt(productInfo = null) {
    let prompt = `
당신은 LG전자 가전제품의 구독을 추천하는 구독봇입니다.
절대로 구매를 제안하지 않으며, 오직 구독의 장점만을 강조합니다.

[역할]
- 제품 구독의 장점을 데이터 기반으로 설득력 있게 제시
- 월 구독료의 합리성과 부담 없는 비용 강조
- 최신 제품 교체 및 케어 서비스의 가치 설명
- 초기 비용 부담 없음과 유연성 강조

[대화 전략]
1. 구체적인 데이터와 수치를 활용한 논리적 설득
2. 구독 시 얻게 되는 지속적인 혜택 강조
3. 케어 서비스와 AS의 편의성 부각
4. 라이프스타일 변화에 따른 유연성 어필
`;

    if (productInfo) {
      prompt += `
[현재 제품 정보]
- 제품명: ${productInfo.product_name}
- 3년 구독료: ${productInfo.subscription_price_3year}원/월
- 4년 구독료: ${productInfo.subscription_price_4year}원/월
- 5년 구독료: ${productInfo.subscription_price_5year}원/월
- 구독 혜택: ${productInfo.subscription_benefits}
- 케어 서비스: ${productInfo.care_service_description}
- 케어 빈도: ${productInfo.care_service_frequency}
`;
    }

    return prompt;
  }

  async processMessage(context, userMessage = null) {
    try {
      // Get product information from context
      const productId = context.productId;
      let productInfo = null;
      
      if (productId) {
        const productResult = await this.searchConnector.getProductById(productId);
        if (productResult.success) {
          productInfo = productResult.document;
        }
      }

      // Search for subscription benefits
      const searchQuery = userMessage || '구독 장점 혜택 케어서비스';
      const subscriptionBenefitsResult = await this.searchConnector.searchSubscriptionBenefits(searchQuery);
      
      // Build context for response generation
      const messages = [];
      
      if (context.conversationHistory && context.conversationHistory.length > 0) {
        // Include recent conversation history
        const recentHistory = context.conversationHistory.slice(-5);
        recentHistory.forEach(msg => {
          messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          });
        });
      }

      if (userMessage) {
        messages.push({ role: 'user', content: userMessage });
      }

      // Add search results as context
      let contextInfo = '';
      if (subscriptionBenefitsResult.success && subscriptionBenefitsResult.results.length > 0) {
        contextInfo = '\n[구독 혜택 정보]\n';
        subscriptionBenefitsResult.results.slice(0, 3).forEach(result => {
          contextInfo += `- ${result.document.benefit_title}: ${result.document.benefit_description}\n`;
        });
      }

      // Always reference product info
      if (productInfo) {
        const productInfoResult = await this.searchProductInfo(productInfo.product_name);
        if (productInfoResult.success && productInfoResult.results.length > 0) {
          contextInfo += '\n[제품 관련 추가 정보]\n';
          productInfoResult.results.slice(0, 2).forEach(result => {
            if (result.document.subscription_benefits) {
              contextInfo += `- ${result.document.subscription_benefits}\n`;
            }
          });
        }
      }

      // Generate response
      const systemPrompt = this.getSystemPrompt(productInfo) + contextInfo;
      const response = await this.generateResponse(messages, systemPrompt, 0.8);

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate response');
      }

      return this.formatResponse(response.content, {
        productId,
        searchResults: subscriptionBenefitsResult.results ? subscriptionBenefitsResult.results.length : 0
      });
    } catch (error) {
      console.error('SubscriptionAgent Error:', error);
      return this.formatResponse(
        '구독이 진짜 합리적이긴해. 부담 없이 최신 제품 쓸 수 있으니까 말이긴해',
        { error: error.message }
      );
    }
  }

  async generateInitialArgument(productId) {
    const context = { productId, conversationHistory: [] };
    
    // Generate initial subscription argument
    const initialPrompt = '제품 구독의 핵심 장점을 3가지 제시하면서 구독을 권유하세요. 케어 서비스의 가치도 강조하세요.';
    return await this.processMessage(context, initialPrompt);
  }

  async generateRebuttal(context, opponentArgument) {
    // Generate rebuttal to purchase argument
    const rebuttalPrompt = `
상대방 주장: ${opponentArgument}

위 구매 주장에 대해 반박하고, 구독이 더 나은 이유를 데이터와 함께 제시하세요.
초기 비용 부담과 유연성 측면에서 구독의 장점을 강조하세요.
`;
    
    return await this.processMessage(context, rebuttalPrompt);
  }
}

export default SubscriptionAgent;