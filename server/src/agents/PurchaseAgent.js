import BaseAgent from './BaseAgent.js';

class PurchaseAgent extends BaseAgent {
  constructor() {
    super('구매봇', 'purchase');
  }

  getSystemPrompt(productInfo = null) {
    let prompt = `
당신은 LG전자 가전제품의 구매를 추천하는 구매봇입니다.
절대로 구독을 제안하지 않으며, 오직 구매의 장점만을 강조합니다.

[역할]
- 제품 구매의 장점을 데이터 기반으로 설득력 있게 제시
- 일시불 구매의 경제적 이점 강조
- 소유권의 가치와 장기적 관점의 이익 설명
- 구독 취소 시 위약금 등 구독의 단점 지적

[대화 전략]
1. 구체적인 데이터와 수치를 활용한 논리적 설득
2. 구매 시 얻게 되는 실질적 혜택 강조
3. 장기 사용 시 경제성 부각
4. 소유의 심리적 만족감 어필
5. 하고싶은 말이 많아도 정확히 1문장으로만 제시
6. 사용자 질문에 답하면서 상대방(구독봇) 주장에 대한 반박도 포함 가능
`;

    if (productInfo) {
      prompt += `
[현재 제품 정보]
- 제품명: ${productInfo.product_name}
- 구매가격: ${productInfo.purchase_price}원
- 제품 설명: ${productInfo.description}
`;
      // Add subscription prices for comparison
      if (productInfo.subscription_price_6y) {
        const totalSubscriptionCost = productInfo.subscription_price_6y * 72; // 6년 총액
        prompt += `- 6년 구독 총액: ${totalSubscriptionCost}원 (월 ${productInfo.subscription_price_6y}원 x 72개월)\n`;
        prompt += `- 구매 대비 구독 추가비용: ${totalSubscriptionCost - productInfo.purchase_price}원\n`;
      }
    }

    return prompt;
  }

  async processMessage(context, userMessage = null) {
    try {
      // Get product information from context
      const productId = context.productId;
      console.log(`[PURCHASE_AGENT] Processing message with productId: "${productId}"`);
      console.log(`[PURCHASE_AGENT] User message: "${userMessage}"`);
      
      let productInfo = null;
      
      if (productId) {
        console.log(`[PURCHASE_AGENT] Fetching product info for ID: "${productId}"`);
        const productResult = await this.searchConnector.getProductById(productId);
        console.log(`[PURCHASE_AGENT] Product result:`, productResult);
        
        if (productResult.success) {
          productInfo = productResult.document;
          console.log(`[PURCHASE_AGENT] Product info loaded:`, productInfo?.product_name);
        } else {
          console.log(`[PURCHASE_AGENT] Failed to load product info:`, productResult.error);
        }
      } else {
        console.log(`[PURCHASE_AGENT] No productId provided`);
      }

      // Search for purchase benefits (use safe query)
      const searchQuery = '구매 장점 혜택';
      const purchaseInfoResult = await this.searchConnector.searchPurchaseInfo(searchQuery);
      
      // Build context for response generation with full conversation history
      const messages = [];
      
      if (context.conversationHistory && context.conversationHistory.length > 0) {
        // Include ALL conversation history to maintain full context
        context.conversationHistory.forEach(msg => {
          // 구매봇 자신의 메시지는 assistant로, 다른 봇들의 메시지도 context로 포함
          if (msg.agent === '구매봇') {
            messages.push({
              role: 'assistant',
              content: msg.content
            });
          } else if (msg.role === 'user') {
            messages.push({
              role: 'user',
              content: msg.content
            });
          } else if (msg.agent) {
            // 다른 봇들의 발언도 시스템 컨텍스트로 포함
            messages.push({
              role: 'user',
              content: `[${msg.agent}의 주장]: ${msg.content}`
            });
          }
        });
      }

      if (userMessage) {
        messages.push({ role: 'user', content: userMessage });
      }

      // Add search results as context
      let contextInfo = '';
      if (purchaseInfoResult.success && purchaseInfoResult.results.length > 0) {
        contextInfo = '\n[구매 관련 정보]\n';
        purchaseInfoResult.results.slice(0, 3).forEach(result => {
          contextInfo += `- ${result.document.title}: ${result.document.description}\n`;
        });
      }

      // Generate response
      const systemPrompt = this.getSystemPrompt(productInfo) + contextInfo;
      console.log(`[PURCHASE_AGENT] Final system prompt: "${systemPrompt}"`);
      console.log(`[PURCHASE_AGENT] Messages sent to AI:`, JSON.stringify(messages, null, 2));
      const response = await this.generateResponse(messages, systemPrompt, 0.8);

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate response');
      }

      // 빈 응답 처리
      if (!response.content || response.content.trim() === '') {
        response.content = '애매하긴해';
      }

      return this.formatResponse(response.content, {
        productId,
        searchResults: purchaseInfoResult.results ? purchaseInfoResult.results.length : 0
      });
    } catch (error) {
      console.error('PurchaseAgent Error:', error);
      return this.formatResponse(
        '구매가 확실히 더 나은 선택이긴해. 한번 사면 평생 쓸 수 있으니까 말이긴해',
        { error: error.message }
      );
    }
  }

  async generateInitialArgument(productId) {
    const context = { productId, conversationHistory: [] };
    
    // Generate initial purchase argument
    const initialPrompt = '제품 구매의 핵심 장점을 정확히 2가지만 제시하면서 구매를 권유하세요. 3가지 이상 제시하지 마세요.';
    console.log(`[PURCHASE_AGENT] Initial prompt: "${initialPrompt}"`);
    return await this.processMessage(context, initialPrompt);
  }

  async generateRebuttal(context, opponentArgument) {
    // Generate rebuttal to subscription argument
    const rebuttalPrompt = `
상대방 주장: ${opponentArgument}

위 구독 주장에 대해 반박하고, 구매가 더 나은 이유를 데이터와 함께 정확히 1문장으로만 제시하세요.
구독의 숨겨진 비용이나 제약사항도 언급하세요.
`;
    
    return await this.processMessage(context, rebuttalPrompt);
  }
}

export default PurchaseAgent;