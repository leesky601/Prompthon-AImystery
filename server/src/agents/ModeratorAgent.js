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
      
      // Build full conversation context
      let fullContext = '';
      if (conversationHistory.length > 0) {
        fullContext = '\n[전체 대화 내역]\n';
        conversationHistory.slice(-10).forEach(msg => {
          const speaker = msg.role === 'user' ? '사용자' : (msg.agent || '봇');
          fullContext += `${speaker}: ${msg.content}\n`;
        });
      }

      // Get last purchase and subscription arguments
      const recentPurchaseArgs = conversationHistory
        .filter(msg => msg.agent === '구매봇')
        .slice(-2);
      const recentSubscriptionArgs = conversationHistory
        .filter(msg => msg.agent === '구독봇')
        .slice(-2);

      let summaryContext = fullContext;
      
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
        content: `다음 대화 내용을 기반으로 응답하세요: ${summaryContext}
        
아직 다루지 않은 주제: ${suggestedTopics.join(', ')}

필수 응답 형식:
1. 먼저 구매봇과 구독봇의 핵심 주장을 한 문장씩 요약하세요
2. 그 다음 사용자에게 새로운 관점의 질문을 하세요
3. 답변은 3문장 이내로 간결하게 하세요

예시:
"구매봇은 [핵심주장] 라고 하고, 구독봇은 [핵심주장] 라고 하긴해. 
그런데 [사용자 관련 질문]이 더 중요하지 않긴해?"`
      }];

      const systemPrompt = this.getSystemPrompt() + `
필수 규칙:
- 반드시 구매봇과 구독봇의 주장을 요약하고 시작하세요
- "이전 대화 기록이 없다"는 등의 시스템 메시지 절대 금지
- 대화가 없어도 일반적인 구매/구독 장단점으로 요약 생성
- 자연스러운 대화체 유지
`;
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
      
      // 전체 대화 내용 구성
      let fullConversation = '\n[전체 대화 내용]\n';
      conversationHistory.forEach(msg => {
        if (msg.role === 'user') {
          fullConversation += `사용자: ${msg.content}\n`;
        } else if (msg.agent) {
          fullConversation += `${msg.agent}: ${msg.content}\n`;
        }
      });

      // 사용자 응답만 추출
      const userResponses = conversationHistory.filter(msg => msg.role === 'user');
      const userContextLines = userResponses.map(r => `- ${r.content}`).join('\n');
      
      // 구매봇과 구독봇의 주요 논점 추출
      const purchasePoints = conversationHistory
        .filter(msg => msg.agent === '구매봇')
        .map(msg => msg.content)
        .join(' ');
      
      const subscriptionPoints = conversationHistory
        .filter(msg => msg.agent === '구독봇')
        .map(msg => msg.content)
        .join(' ');

      const messages = [{
        role: 'user',
        content: `다음은 구매 vs 구독에 대한 전체 토론 내용입니다:
${fullConversation}

[사용자 응답 분석]
${userContextLines || '사용자가 구체적인 선호를 표현하지 않았음'}

[구매봇 주요 논점]
${purchasePoints || '구매의 일반적 장점: 소유권, 장기 경제성'}

[구독봇 주요 논점]  
${subscriptionPoints || '구독의 일반적 장점: 낮은 초기비용, 케어서비스'}

위 대화 내용을 모두 고려하여 '구매' 또는 '구독' 중 하나를 명확히 추천하세요.
반드시 아래 형식을 지키세요:

[최종 결론]: (구매|구독) 중 하나만 기재
[적합도]: 구매 XX%, 구독 YY% (합계 100%)
[핵심 근거 3줄]:
- 근거1 (대화에서 나온 구체적 내용 인용)
- 근거2 (대화에서 나온 구체적 내용 인용)
- 근거3 (대화에서 나온 구체적 내용 인용)
[다음 단계 제안 1줄]: 구체적 행동 제시`
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
    // 대화 턴에 따라 다양한 응답 세트를 제공
    const topicResponseSets = {
      '초기 비용 부담': [
        ['초기 비용이 부담스러워요', '일시불로 구매할 여유가 있어요'],
        ['할부도 가능한가요?', '현금 구매 시 할인이 있나요?'],
        ['월 납부액이 궁금해요', '총 비용 비교를 보고 싶어요']
      ],
      '케어 서비스 필요성': [
        ['케어 서비스가 꼭 필요해요', '스스로 관리할 수 있어요'],
        ['AS 비용이 걱정돼요', '보증 기간이 얼마나 되나요?'],
        ['정기 점검이 필요한가요?', '고장 나면 어떻게 하죠?']
      ],
      '제품 교체 주기': [
        ['최신 제품을 자주 바꾸고 싶어요', '한 제품을 오래 사용하는 편이에요'],
        ['3년 후에도 성능이 괜찮을까요?', '신제품 출시 주기가 어떻게 되나요?'],
        ['중고로 팔 때 가격이 어느 정도인가요?', '업그레이드 혜택이 있나요?']
      ],
      '사용 패턴과 라이프스타일': [
        ['자주 이사를 다니는 편이에요', '한 곳에 오래 정착해 있어요'],
        ['1인 가구에 적합한가요?', '가족이 늘어날 예정이에요'],
        ['주말에만 사용해요', '매일 사용하는 필수품이에요']
      ],
      '장기 경제성': [
        ['장기적인 비용 절감이 중요해요', '월 고정 지출이 편해요'],
        ['5년 사용 시 총 비용이 궁금해요', '전기료 절약이 되나요?'],
        ['감가상각을 고려하면 어떤가요?', '투자 가치가 있을까요?']
      ],
      '소유권의 가치': [
        ['내 것이라는 느낌이 중요해요', '소유보다 사용이 중요해요'],
        ['자산으로 남는 게 좋아요', '짐이 되는 건 싫어요'],
        ['커스터마이징을 하고 싶어요', '기본 기능만 있으면 돼요']
      ],
      '최신 기술 선호도': [
        ['항상 최신 기능을 써보고 싶어요', '검증된 기술이 안전해요'],
        ['AI 기능이 정말 필요한가요?', '기존 모델과 차이가 큰가요?'],
        ['스마트 기능 활용도가 높아요', '기본 기능만 써요']
      ],
      '이사나 환경 변화 가능성': [
        ['곧 이사 예정이에요', '당분간 이사 계획 없어요'],
        ['해외 거주 가능성이 있어요', '평생 여기 살 예정이에요'],
        ['전세라서 불안해요', '자가 소유예요']
      ]
    };

    // 대화 턴 수에 따라 다른 응답 세트 선택
    const conversationTurn = Math.floor(Math.random() * 3); // 0, 1, 2 중 랜덤
    const responseSet = topicResponseSets[suggestedTopic];
    
    if (responseSet && responseSet[conversationTurn]) {
      return responseSet[conversationTurn];
    }
    
    // 기본 응답들도 다양화
    const defaultResponses = [
      ['구독이 더 나을 것 같아요', '구매가 더 합리적인 것 같아요'],
      ['더 자세히 알아보고 싶어요', '다른 옵션도 있나요?'],
      ['실제 사용자 후기가 궁금해요', '전문가 의견을 듣고 싶어요']
    ];
    
    return defaultResponses[conversationTurn] || defaultResponses[0];
  }
}

export default ModeratorAgent;