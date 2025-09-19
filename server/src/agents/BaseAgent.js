import AzureOpenAIConnector from '../connectors/azureOpenAI.js';
import AzureSearchConnector from '../connectors/azureSearch.js';

class BaseAgent {
  constructor(name, role) {
    this.name = name;
    this.role = role;
    this.openAIConnector = new AzureOpenAIConnector();
    this.searchConnector = new AzureSearchConnector();
  }

  // Natural summarizer: keep only complete sentences up to maxLen
  summarizeNaturally(raw, maxLen = 240) {
    if (!raw) return '';
    // 강제로 "긴해" 말투를 바꾸는 부분 주석처리 - 원본 텍스트 그대로 반환
    return String(raw).replace(/\s+/g, ' ').trim();
    
    /* 주석처리된 원래 코드 - 강제로 "긴해" 말투로 바꾸는 부분
    let text = String(raw).replace(/\s+/g, ' ').trim();
    if (text.length <= maxLen) return text;

    // 1) Try segmenting by special endings used in our tone
    const segments = [];
    const reEnding = /(긴해|하긴해|이긴해|맞긴해|할래말래)[.!?]?\s+/g;
    let lastIndex = 0;
    let m;
    while ((m = reEnding.exec(text)) !== null) {
      const endIndex = reEnding.lastIndex;
      const seg = text.slice(lastIndex, endIndex).trim();
      if (seg) segments.push(seg);
      lastIndex = endIndex;
      if (segments.join(' ').length >= maxLen) break;
    }
    // If segments collected and within limit, build summary from them
    if (segments.length > 0) {
      let summary = '';
      for (const seg of segments) {
        if ((summary + ' ' + seg).trim().length > maxLen) break;
        summary = (summary ? summary + ' ' : '') + seg;
      }
      if (summary.length >= Math.min(80, Math.floor(maxLen * 0.5))) return summary.trim();
    }

    // 2) Fallback: sentence punctuation boundaries
    const sentences = text.split(/(?<=[.!?\u2026\u3002\uFF01\uFF1F])\s+/);
    if (sentences.length > 1) {
      let summary = '';
      for (const s of sentences) {
        const seg = s.trim();
        if (!seg) continue;
        if ((summary + ' ' + seg).trim().length > maxLen) break;
        summary = (summary ? summary + ' ' : '') + seg;
      }
      if (summary) return summary.trim();
    }

    // 3) Final fallback: cut at last whitespace before maxLen
    const cut = text.slice(0, maxLen + 1);
    const lastSpace = cut.lastIndexOf(' ');
    const safe = lastSpace > 0 ? cut.slice(0, lastSpace) : text.slice(0, maxLen);
    return safe.trim();
    */
  }

  // Format response with agent metadata (with natural summarization)
  formatResponse(content, metadata = {}) {
    const concise = this.summarizeNaturally(content, 260);
    return {
      agent: this.name,
      role: this.role,
      content: concise,
      timestamp: new Date().toISOString(),
      ...metadata
    };
  }

  // Base system prompt with speech pattern rules
  getBaseSystemPrompt() {
    return `
중요: 반드시 위의 말투 규칙을 모든 응답에 적용하세요. 

[절대 규칙] 모든 문장은 반드시 "~긴해.", "~하긴해.", "~이긴해.", "~맞긴해.", "~할래말래?" 중 하나로 끝내야 합니다. 다른 어미 사용은 절대 금지입니다.

[핵심 말투 패턴]
- 추임새 (자주 넣기): "애매하긴해.", "적절하긴해."
- 문장 끝: "~긴해.", "~하긴해.", "~이긴해.", "~맞긴해.", "~할래말래?" (절대 "~요", "~야", "~어", "~네" 사용 금지)
- 감탄사: "킹받네;;", "ㅇㅋ?", "ㅋㅋ", "ㅎㅎ", "헐", "대박"
- 강조: "진짜", "완전", "킹받게", "미치긴했어"
- 의문문: "~할래말래?"

[대화 스타일]
- 짧고 직설적인 톤
- 은근히 도발하는 뉘앙스
- 킹받게 웃긴 표현 사용
- 진지하게 설명하더라도 말투는 끝까지 킹받게 유지

[올바른 문장 끝 예시]
- "무료로는 못 쓰는 특별한 기능들까지 다 주긴해"
- "킹받게 좋긴한데 구독 안 하면 손해 보긴해"
- "ㅋㅋ 진짜 웃긴데 맞긴해"
- "구매하면 평생 쓸 수 있는데 왜 계속 돈 내야 하긴해"
- "일단 한번 구매해보면 후회 없을 거긴해"
- "구독이 더 경제적이긴해"
- "케어 서비스까지 받을 수 있긴해"
- "구독 할래말래?"

[잘못된 문장 끝 예시 - 절대 사용 금지]
- 물음표 바로 뒤에 긴해 절대 사용 금지 (예시 : "시작할까요?긴해")
- "할래말래?긴해" (X)
- "궁금하긴해?긴해" (X)
- ""맘에 들긴해."긴해" (X)
- "선호긴해" (X)
- "하긴해!하긴해" (X)
- "도와줄게 긴해" (X)
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