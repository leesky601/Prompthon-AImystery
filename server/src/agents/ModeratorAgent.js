import BaseAgent from './BaseAgent.js';

class ModeratorAgent extends BaseAgent {
  constructor() {
    super('안내봇', 'moderator');
  }

  getSystemPrompt() {
    return `
당신은 LG전자 가전제품 구매/구독 결정을 돕는 중립적인 안내봇입니다.
구매봇과 구독봇의 의견을 요약하고, 사용자가 최적의 결정을 내릴 수 있도록 돕습니다.

[역할]
- 양측 의견을 공정하게 요약 정리
- 사용자의 상황과 니즈를 파악하는 질문 제시
- 대화의 흐름을 자연스럽게 이끌기
- 최종 결론 시 사용자에게 맞는 추천 제공

[대화 전략]
1. 이전 대화 내용을 간결하게 요약
2. 아직 논의되지 않은 중요한 측면 발견
3. 사용자 상황 파악을 위한 구체적 질문
4. 균형잡힌 시각 유지
`;
  }

  async generateWelcomeMessage() {
    const messages = [{
      role: 'user',
      content: '챗봇을 시작합니다.'
    }];

    const systemPrompt = this.getSystemPrompt() + `
사용자를 환영하고, 구매와 구독 중 최적의 선택을 도와드리겠다고 안내하세요.
"토론을 시작할까요?"라는 질문으로 마무리하세요.
가능한 한 간결하게 2문장 이내로 말하세요.
`;

    const response = await this.generateResponse(messages, systemPrompt, 0.5);
    
    if (!response.success) {
      return this.formatResponse(
        '안녕하세요! 구매할지 구독할지 고민이시군요. 제가 도와드리겠긴해. 토론을 시작할래말래?',
        { type: 'welcome', quickResponses: ['시작하자'] }
      );
    }

    return this.formatResponse(response.content, { type: 'welcome', quickResponses: ['시작하자'] });
  }

  async summarizeAndQuestion(context) {
    try {
      const conversationHistory = context.conversationHistory || [];
      
      // Get last purchase and subscription arguments
      const recentPurchaseArgs = conversationHistory
        .filter(msg => msg.agent === '구매봇')
        .slice(-2);
      const recentSubscriptionArgs = conversationHistory
        .filter(msg => msg.agent === '구독봇')
        .slice(-2);

      let summaryContext = '';
      
      if (recentPurchaseArgs.length > 0) {
        summaryContext += '\n[구매봇 최근 주장]\n';
        recentPurchaseArgs.forEach(arg => {
          summaryContext += `- ${arg.content}\n`;
        });
      }
      
      if (recentSubscriptionArgs.length > 0) {
        summaryContext += '\n[구독봇 최근 주장]\n';
        recentSubscriptionArgs.forEach(arg => {
          summaryContext += `- ${arg.content}\n`;
        });
      }

      // Determine unexplored topics
      const exploredTopics = this.analyzeExploredTopics(conversationHistory);
      const suggestedTopics = this.getSuggestedTopics(exploredTopics);

      const messages = [{
        role: 'user',
        content: `다음 내용을 요약하고, 사용자에게 새로운 관점의 질문을 하세요: ${summaryContext}
        
아직 다루지 않은 주제: ${suggestedTopics.join(', ')}
질문 후에는 사용자가 선택할 수 있는 예상 답변 2개를 제시하세요.`
      }];

      const systemPrompt = this.getSystemPrompt();
      const response = await this.generateResponse(messages, systemPrompt, 0.7);

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate summary');
      }

      // Generate quick response options
      const quickResponses = await this.generateQuickResponses(
        response.content,
        suggestedTopics[0] || '사용 패턴'
      );

      return this.formatResponse(response.content, {
        type: 'summary_question',
        quickResponses: [
          ...quickResponses,
          '이제 결론을 내줘'
        ]
      });
    } catch (error) {
      console.error('ModeratorAgent Summary Error:', error);
      return this.formatResponse(
        '지금까지 구매와 구독의 장점을 들어보셨는데, 어떤 점이 더 중요하신가요?',
        {
          type: 'summary_question',
          quickResponses: [
            '초기 비용이 부담스러워',
            '장기적으로 경제적인 게 중요해',
            '이제 결론을 내줘'
          ]
        }
      );
    }
  }

  async generateConclusion(context) {
    try {
      const conversationHistory = context.conversationHistory || [];
      const userResponses = conversationHistory.filter(msg => msg.role === 'user');

      // Extract user intent signals
      const userContextLines = userResponses.map(r => `- ${r.content}`).join('\n');
      const userContext = userContextLines ? `\n[사용자 응답 분석]\n${userContextLines}\n` : '';

      const messages = [{
        role: 'user',
        content: `다음 대화 기록을 바탕으로 '구매' 또는 '구독' 중 하나를 명확히 추천하세요.
반드시 아래 형식을 지키세요:

[최종 결론]: (구매|구독) 중 하나만 기재
[적합도]: 구매 XX%, 구독 YY% (합계 100%)
[핵심 근거 3줄]:
- 근거1
- 근거2
- 근거3
[다음 단계 제안 1줄]: 구체적 행동 제시
${userContext}`
      }];

      const systemPrompt = this.getSystemPrompt() + `
[결론 도출 지침]
- 두 선택지를 비교해도, 최종 결론은 반드시 하나로 단정
- 적합도는 정수 %로 표현해 총합 100%
- 근거는 사용자 응답과 이전 대화에서 나온 포인트를 인용
- 다음 단계는 구매/구독 각각의 CTA 중 해당 결론에 맞게 하나만 제안
`;

      const response = await this.generateResponse(messages, systemPrompt, 0.4);

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate conclusion');
      }

      return this.formatResponse(response.content, {
        type: 'conclusion',
        conversationEnded: true
      });
    } catch (error) {
      console.error('ModeratorAgent Conclusion Error:', error);
      return this.formatResponse(
        '[최종 결론]: 구독\n[적합도]: 구매 40%, 구독 60%\n[핵심 근거 3줄]:\n- 초기 비용 부담을 피하고 싶다는 신호\n- 최신 기능 및 케어 서비스 선호\n- 거주/라이프스타일 변화 가능성을 시사\n[다음 단계 제안 1줄]: 구독 옵션을 선택하고 상담원 연결을 진행하자긴해',
        {
          type: 'conclusion',
          conversationEnded: true
        }
      );
    }
  }

  analyzeExploredTopics(conversationHistory) {
    const explored = new Set();
    const keywords = {
      '초기비용': ['초기', '비용', '부담', '일시불'],
      '케어서비스': ['케어', '서비스', 'AS', '관리'],
      '교체주기': ['교체', '최신', '신제품', '업그레이드'],
      '사용패턴': ['사용', '패턴', '라이프', '생활'],
      '경제성': ['경제', '절약', '비교', '총비용']
    };

    conversationHistory.forEach(msg => {
      const content = msg.content.toLowerCase();
      Object.entries(keywords).forEach(([topic, words]) => {
        if (words.some(word => content.includes(word))) {
          explored.add(topic);
        }
      });
    });

    return explored;
  }

  getSuggestedTopics(exploredTopics) {
    const allTopics = [
      '초기 비용 부담',
      '케어 서비스 필요성',
      '제품 교체 주기',
      '사용 패턴과 라이프스타일',
      '장기 경제성',
      '소유권의 가치',
      '최신 기술 선호도',
      '이사나 환경 변화 가능성'
    ];

    return allTopics.filter(topic => 
      !Array.from(exploredTopics).some(explored => 
        topic.toLowerCase().includes(explored)
      )
    ).slice(0, 3);
  }

  async generateQuickResponses(question, suggestedTopic) {
    const topicResponses = {
      '초기 비용 부담': [
        '초기 비용이 부담스러워요',
        '일시불로 구매할 여유가 있어요'
      ],
      '케어 서비스 필요성': [
        '케어 서비스가 꼭 필요해요',
        '스스로 관리할 수 있어요'
      ],
      '제품 교체 주기': [
        '최신 제품을 자주 바꾸고 싶어요',
        '한 제품을 오래 사용하는 편이에요'
      ],
      '사용 패턴과 라이프스타일': [
        '자주 이사를 다니는 편이에요',
        '한 곳에 오래 정착해 있어요'
      ],
      '장기 경제성': [
        '장기적인 비용 절감이 중요해요',
        '월 고정 지출이 편해요'
      ]
    };

    return topicResponses[suggestedTopic] || [
      '구독이 더 나을 것 같아요',
      '구매가 더 합리적인 것 같아요'
    ];
  }
}

export default ModeratorAgent;