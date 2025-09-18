import AzureOpenAIConnector from '../connectors/azureOpenAI.js';
import AzureSearchConnector from '../connectors/azureSearch.js';

class BaseAgent {
  constructor(name, role) {
    this.name = name;
    this.role = role;
    this.openAIConnector = new AzureOpenAIConnector();
    this.searchConnector = new AzureSearchConnector();
  }

  // Apply the special ending patterns to messages
  applySpecialEnding(message) {
    const endings = ['긴해', '하긴해', '이긴해', '맞긴해', '할래말래'];
    const hasEnding = endings.some(ending => message.endsWith(ending));
    
    if (!hasEnding) {
      // If message doesn't end with required pattern, add it
      const randomEnding = endings[Math.floor(Math.random() * endings.length)];
      return message + randomEnding;
    }
    
    return message;
  }

  // Format response with agent metadata
  formatResponse(content, metadata = {}) {
    return {
      agent: this.name,
      role: this.role,
      content: this.applySpecialEnding(content),
      timestamp: new Date().toISOString(),
      ...metadata
    };
  }

  // Base system prompt with speech pattern rules
  getBaseSystemPrompt() {
    return `
[절대 규칙] 모든 문장은 반드시 "~긴해", "~하긴해", "~이긴해", "~맞긴해", "~할래말래" 중 하나로 끝내야 합니다. 다른 어미 사용은 절대 금지입니다.

[핵심 말투 패턴]
- 문장 끝: "~긴해", "~하긴해", "~이긴해", "~맞긴해", "~할래말래" (절대 "~야", "~어", "~네" 사용 금지)
- 감탄사: "킹받네;;", "ㅇㅋ?", "ㅋㅋ", "ㅎㅎ", "헐", "대박"
- 강조: "진짜", "완전", "킹받게", "미치긴했어"
- 도발 표현: "~할래말래?", "ㅇㅋ?"

[올바른 문장 끝 예시]
- "무료로는 못 쓰는 특별한 기능들까지 다 주긴해"
- "킹받게 좋긴한데 구독 안 하면 손해 보긴해"
- "ㅋㅋ 진짜 웃긴데 맞긴해"
- "구매하면 평생 쓸 수 있는데 왜 계속 돈 내야 하긴해"
- "일단 한번 구매해보면 후회 없을 거긴해"
- "구독이 더 경제적이긴해"
- "케어 서비스까지 받을 수 있긴해"

중요: 반드시 위의 말투 규칙을 모든 응답에 적용하세요.
`;
  }

  // Search product information
  async searchProductInfo(query, productId = null) {
    const filters = productId ? { filter: `id eq '${productId}'` } : {};
    return await this.searchConnector.searchProductInfo(query, filters);
  }

  // Generate response using Azure OpenAI
  async generateResponse(messages, systemPrompt, temperature = 0.7) {
    const fullSystemPrompt = this.getBaseSystemPrompt() + '\n\n' + systemPrompt;
    return await this.openAIConnector.generateResponse(
      messages,
      fullSystemPrompt,
      temperature
    );
  }

  // Abstract method to be implemented by child classes
  async processMessage(context, userMessage) {
    throw new Error('processMessage must be implemented by child class');
  }
}

export default BaseAgent;