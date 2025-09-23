import BaseAgent from './BaseAgent.js';

class ModeratorAgent extends BaseAgent {
  constructor() {
    super('안내봇', 'moderator');
    // 질문 히스토리를 세션별로 저장
    this.questionHistory = new Map(); // sessionId -> Set of questions
    this.maxQuestionHistory = 20; // 최대 20개의 질문 기억
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
사용자를 환영하고, 구매와 구독이 애매하지만 이 중 최적의 선택을 도와드리겠다고 안내하세요.
"토론을 시작할까요?"라는 질문으로 마무리하세요.
가능한 한 간결하게 2문장 이내로 말하세요.
`;

    const response = await this.generateResponse(messages, systemPrompt, 0.5);
    
    if (!response.success) {
      return this.formatResponse(
        '안녕하긴해! 구매할지 구독할지 애매하긴해. 제가 도와줄 수 있긴해. 토론을 시작할래말래?',
        { type: 'welcome', quickResponses: ['시작하자'] }
      );
    }

    return this.formatResponse(response.content, { type: 'welcome', quickResponses: ['시작하자'] });
  }

  // 세션별 질문 히스토리 관리
  getSessionQuestions(sessionId) {
    if (!this.questionHistory.has(sessionId)) {
      this.questionHistory.set(sessionId, new Set());
    }
    return this.questionHistory.get(sessionId);
  }
  
  addQuestionToHistory(sessionId, question) {
    const questions = this.getSessionQuestions(sessionId);
    questions.add(question);
    
    // 최대 개수 제한
    if (questions.size > this.maxQuestionHistory) {
      const questionsArray = Array.from(questions);
      questions.clear();
      questionsArray.slice(-this.maxQuestionHistory).forEach(q => questions.add(q));
    }
  }
  
  async summarizeAndQuestion(context) {
    try {
      const conversationHistory = context.conversationHistory || [];
      const productId = context.productId;
      const sessionId = context.sessionId || 'default'; // 세션 ID 가져오기
      
      // Get product info if available
      let productInfo = null;
      if (productId) {
        const productResult = await this.searchConnector.getProductById(productId);
        if (productResult.success && productResult.document) {
          productInfo = productResult.document;
        }
      }
      
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
      const unansweredTopics = []; // AI가 직접 분석하므로 빈 배열로 설정
      const suggestedTopics = this.getSuggestedTopics(exploredTopics, unansweredTopics, conversationHistory);
      
      // 이전에 했던 질문들 가져오기
      const previousQuestions = this.getSessionQuestions(sessionId);
      let previousQuestionsContext = '';
      if (previousQuestions.size > 0) {
        previousQuestionsContext = '\n[이미 했던 질문들 - 절대 반복하지 마세요]\n';
        Array.from(previousQuestions).forEach(q => {
          previousQuestionsContext += `- ${q}\n`;
        });
      }
      
      // 사용자 응답 분석 추가
      const userResponses = conversationHistory.filter(msg => msg.role === 'user');
      let userContext = '';
      if (userResponses.length > 0) {
        userContext = '\n[사용자 응답 분석]\n';
        userResponses.slice(-3).forEach((response, index) => {
          userContext += `- 응답 ${index + 1}: ${response.content}\n`;
        });
        
        // AI가 직접 사용자 응답을 분석하도록 안내
        userContext += `\n[중요] 사용자 응답을 분석하여 어떤 주제에 대해 답변했는지 파악하고, 아직 답변하지 않은 주제에 대해 질문하세요.\n`;
        
        // 사용자 응답이 적을 때 추가 안내
        if (userResponses.length <= 1) {
          userContext += '\n[주의] 사용자가 아직 한 번만 답변했습니다. 더 구체적이고 개인적인 상황을 묻는 질문을 하세요.\n';
        }
      }

      // Add product context if available
      if (productInfo) {
        summaryContext += `\n\n[현재 논의 제품]\n`;
        summaryContext += `- 제품명: ${productInfo.product_name}\n`;
        summaryContext += `- 구매가격: ${productInfo.purchase_price}원\n`;
        if (productInfo.subscription_price_6y) {
          summaryContext += `- 6년 구독료: 월 ${productInfo.subscription_price_6y}원\n`;
        }
      }
      
      const messages = [{
        role: 'user',
        content: `다음 대화 내용을 기반으로 응답하세요: ${summaryContext}${userContext}${previousQuestionsContext}
        
아직 다루지 않은 주제: ${suggestedTopics.join(', ')}

[매우 중요] 중복 방지:
- 위의 "이미 했던 질문들" 목록에 있는 질문과 유사한 질문을 절대 하지 마세요
- 완전히 새로운 관점이나 주제에 대해 질문하세요
- 사용자가 이미 답변한 주제들을 파악하고, 아직 답변하지 않은 주제에 대해 질문하세요

[중요] 사용자 응답 분석:
- 사용자가 이미 답변한 주제들을 파악하고, 아직 답변하지 않은 주제에 대해 질문하세요
- 사용자 응답이 적을 때는 더 구체적이고 개인적인 상황을 묻는 질문을 하세요
- 중복 질문을 피하고 새로운 관점의 질문을 하세요

필수 응답 형식:
1. 이전 질문과 완전히 다른 새로운 질문을 하세요
2. 답변은 정확히 1문장으로만 하세요
3. 사용자가 이미 답변한 내용과 중복되지 않도록 하세요
4. 아직 답변하지 않은 주제에 대해 구체적으로 질문하세요

예시:
- "그럼 [구체적인 상황]에 대해서는 어떻게 생각하긴해?"
- "[새로운 관점]이 궁금하긴해, 알려줄래 말래?"
- "[사용자 상황]을 고려하면 어떤 게 더 나을 것 같긴해?"
`
      }];

      const systemPrompt = this.getSystemPrompt() + `
필수 규칙:
- 구매봇과 구독봇의 주장 요약 없이 바로 사용자에게 질문하세요
- 정확히 1문장으로만 응답하세요
- 자연스러운 대화체 유지
- 사용자가 이미 답변한 주제는 피하고 아직 답변하지 않은 주제에 대해 질문하세요
- 사용자 응답 분석을 통해 중복을 피하고 새로운 관점의 질문을 하세요
`;
      const response = await this.generateResponse(messages, systemPrompt, 0.7);

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate summary');
      }

      // 빈 응답 처리
      if (!response.content || response.content.trim() === '') {
        response.content = '애매하긴해';
      }
      
      // 생성된 질문을 히스토리에 추가
      this.addQuestionToHistory(sessionId, response.content);
      console.log(`[MODERATOR] Added question to history for session ${sessionId}: "${response.content}"`);
      console.log(`[MODERATOR] Total questions in history: ${this.getSessionQuestions(sessionId).size}`);

      // Generate quick response options
      const quickResponses = await this.generateQuickResponses(
        conversationHistory,
        exploredTopics,
        unansweredTopics,
        response.content  // 현재 생성 중인 안내봇 질문 전달
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
      const productId = context.productId;
      
      // Get product info if available
      let productInfo = null;
      if (productId) {
        try {
          const productResult = await this.searchConnector.getProductById(productId);
          if (productResult.success && productResult.document) {
            productInfo = productResult.document;
          }
        } catch (searchError) {
          console.error('Product search error:', searchError);
          // Continue without product info
        }
      }
      
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

      // Add product price comparison if available
      let priceComparison = '';
      if (productInfo) {
        priceComparison = `\n[제품 가격 비교]\n`;
        priceComparison += `- 제품명: ${productInfo.product_name}\n`;
        priceComparison += `- 구매가격: ${productInfo.purchase_price}원\n`;
        if (productInfo.subscription_price_6y) {
          const total6y = productInfo.subscription_price_6y * 72;
          priceComparison += `- 6년 구독 총액: ${total6y}원 (월 ${productInfo.subscription_price_6y}원)\n`;
          priceComparison += `- 차액: ${Math.abs(total6y - productInfo.purchase_price)}원 (구독이 ${total6y > productInfo.purchase_price ? '더 비싸짐' : '더 저렴함'})\n`;
        }
      }
      
      const messages = [{
        role: 'user',
        content: `다음은 구매 vs 구독에 대한 전체 토론 내용입니다:
${fullConversation}
${priceComparison}

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
      
      // 에러 발생 시 기본 응답 (구매 추천)
      return this.formatResponse(
        '[최종 결론]: 구매\n[적합도]: 구매 50%, 구독 50%\n[핵심 근거 3줄]:\n- 기본 추천\n- 구매 시 소유권 확보 및 장기 경제성\n- 안정적인 사용 환경 제공\n[다음 단계 제안 1줄]: 구매 옵션을 선택하고 상담원 연결을 진행하긴해',
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
      '초기비용': ['초기', '비용', '부담', '일시불', '할부', '현금', '월 납부', '초기비용이', '부담스러워', '부담돼'],
      '케어서비스': ['케어', '서비스', 'AS', '관리', '점검', '고장', '보증', '케어서비스가', '필요해', '걱정돼'],
      '교체주기': ['교체', '최신', '신제품', '업그레이드', '중고', '성능', '최신기술을', '원해', '기술이'],
      '사용패턴': ['사용', '패턴', '라이프', '생활', '이사', '가구', '주말', '매일', '사용빈도가', '높아', '가끔씩만', '쓸 것 같아'],
      '경제성': ['경제', '절약', '비교', '총비용', '전기료', '감가상각', '투자', '장기적으로', '경제적인', '중요해'],
      '소유권': ['소유', '내 것', '자산', '짐', '커스터마이징', '소유권이', '중요해'],
      '최신기술': ['최신 기능', 'AI 기능', '스마트 기능', '기존 모델', '최신기술을', '원해', '기능이'],
      '환경변화': ['이사', '해외', '전세', '자가', '이사할', '가능성이', '있어', '안정적으로', '환경변화가', '있을 수 있어']
    };

    // 사용자 응답만 분석 (role === 'user'인 메시지만)
    const userMessages = conversationHistory.filter(msg => msg.role === 'user');
    
    userMessages.forEach(msg => {
      const content = msg.content.toLowerCase();
      
      // 각 주제의 키워드 확인
      Object.entries(keywords).forEach(([topic, words]) => {
        if (words.some(word => content.includes(word))) {
          explored.add(topic);
        }
      });
    });

    // AI가 직접 분석하므로 키워드 매핑 결과를 그대로 사용
    console.log('탐색된 주제들:', Array.from(explored));
    return explored;
  }

  // findUnansweredQuestions 메서드는 더 이상 사용하지 않음 - AI가 직접 분석
  // findUnansweredQuestions(conversationHistory, exploredTopics) {
  //   const unansweredTopics = new Set();
    
  //   // 안내봇 질문과 사용자 응답을 매칭
  //   for (let i = 0; i < conversationHistory.length; i++) {
  //     const msg = conversationHistory[i];
      
  //     // 안내봇 질문 찾기
  //     if (msg.agent === '안내봇' && msg.content.includes('?')) {
  //       const questionContent = msg.content.toLowerCase();
        
  //       // 질문에서 주제 추출 (개선된 로직)
  //       let questionTopic = null;
        
  //       // 각 주제별로 더 정확한 키워드 매칭
  //       const questionTopicKeywords = {
  //         '초기비용': ['초기', '비용', '부담', '일시불', '할부', '현금', '돈', '가격', '구매비', '지불', '결제'],
  //         '케어서비스': ['케어', '서비스', 'AS', '관리', '점검', '고장', '보증', '수리', '필터', '청소'],
  //         '교체주기': ['교체', '최신', '신제품', '업그레이드', '중고', '성능', '기능', '모델', '신형', '구형'],
  //         '사용패턴': ['사용', '패턴', '라이프', '생활', '이사', '가구', '주말', '매일', '자주', '가끔', '빈도'],
  //         '경제성': ['경제', '절약', '비교', '총비용', '전기료', '감가상각', '투자', '효율', '비용절감', '장기'],
  //         '소유권': ['소유', '내 것', '자산', '짐', '커스터마이징', '소유감', '내가', '나의', '개인'],
  //         '최신기술': ['최신 기능', 'AI 기능', '스마트 기능', '기존 모델', '신기능', '기술', '스마트', 'AI', '자동'],
  //         '환경변화': ['이사', '해외', '전세', '자가', '환경', '변화', '상황', '계획', '미래', '위치']
  //       };
        
  //       // 각 주제별로 키워드 매칭 확인
  //       for (const [topic, keywords] of Object.entries(questionTopicKeywords)) {
  //         const matchedKeywords = keywords.filter(keyword => {
  //           const regex = new RegExp(`\\b${keyword}\\b`, 'i');
  //           return regex.test(questionContent);
  //         });
          
  //         if (matchedKeywords.length > 0) {
  //           questionTopic = topic;
  //           console.log(`[MODERATOR] 질문에서 ${topic} 주제 감지: ${matchedKeywords.join(', ')}`);
  //           break;
  //         }
  //       }
        
  //       // 해당 주제에 대한 사용자 응답이 있는지 확인
  //       if (questionTopic && exploredTopics.has(questionTopic)) {
  //         let hasAnswer = false;
          
  //         // 질문 이후의 사용자 응답들 확인
  //         for (let j = i + 1; j < conversationHistory.length; j++) {
  //           const nextMsg = conversationHistory[j];
  //           if (nextMsg.role === 'user') {
  //             const answerContent = nextMsg.content.toLowerCase();
              
  //             // 답변이 해당 주제와 관련이 있는지 확인 (개선된 키워드 매칭)
  //             const topicKeywords = {
  //               '초기비용': ['초기', '비용', '부담', '일시불', '할부', '현금', '돈', '가격', '구매비', '지불', '결제', '비싸', '저렴', '할인', '카드', '포인트'],
  //               '케어서비스': ['케어', '서비스', 'AS', '관리', '점검', '고장', '보증', '수리', '교체', '필터', '청소', '유지보수', '관리비', '추가비용'],
  //               '교체주기': ['교체', '최신', '신제품', '업그레이드', '중고', '성능', '기능', '모델', '신형', '구형', '새것', '오래된', '기술'],
  //               '사용패턴': ['사용', '패턴', '라이프', '생활', '이사', '가구', '주말', '매일', '자주', '가끔', '빈도', '습관', '일상', '생활방식'],
  //               '경제성': ['경제', '절약', '비교', '총비용', '전기료', '감가상각', '투자', '효율', '절약', '비용절감', '장기', '단기', '수익', '손해'],
  //               '소유권': ['소유', '내 것', '자산', '짐', '커스터마이징', '소유감', '내가', '나의', '개인', '소유물', '재산'],
  //               '최신기술': ['최신 기능', 'AI 기능', '스마트 기능', '기존 모델', '신기능', '기술', '스마트', 'AI', '자동', '편의기능'],
  //               '환경변화': ['이사', '해외', '전세', '자가', '환경', '변화', '상황', '계획', '미래', '위치', '장소']
  //             };
              
  //             // 더 정확한 매칭을 위해 키워드별로 확인
  //             if (topicKeywords[questionTopic]) {
  //               const keywords = topicKeywords[questionTopic];
  //               const matchedKeywords = keywords.filter(keyword => {
  //                 // 정확한 단어 경계를 고려한 매칭
  //                 const regex = new RegExp(`\\b${keyword}\\b`, 'i');
  //                 return regex.test(answerContent);
  //               });
                
  //               // 키워드가 1개 이상 매칭되면 답변한 것으로 간주
  //               if (matchedKeywords.length > 0) {
  //                 console.log(`[MODERATOR] 사용자 답변에서 ${questionTopic} 관련 키워드 발견: ${matchedKeywords.join(', ')}`);
  //                 hasAnswer = true;
  //                 break;
  //               }
  //             }
  //           }
  //         }
          
  //         // 답변이 없으면 미답변 주제로 추가
  //         if (!hasAnswer) {
  //           unansweredTopics.add(questionTopic);
  //         }
  //       }
  //     }
  //   }
    
  //   return Array.from(unansweredTopics);
  // }

  getUserResponsesFromHistory(conversationHistory = []) {
    // 현재 대화 기록에서 사용자 응답만 추출
    return conversationHistory.filter(msg => msg.role === 'user');
  }

  // analyzeUserAnsweredTopics 메서드는 더 이상 사용하지 않음 - AI가 직접 분석
  // analyzeUserAnsweredTopics(userResponses) {
  //   // 사용자 응답에서 답변한 주제들을 분석
  //   const topicKeywords = {
  //     '초기비용': ['초기', '비용', '부담', '일시불', '할부', '현금', '돈', '가격', '구매비', '지불', '결제', '비싸', '저렴', '할인', '카드', '포인트'],
  //     '케어서비스': ['케어', '서비스', 'AS', '관리', '점검', '고장', '보증', '수리', '교체', '필터', '청소', '유지보수', '관리비', '추가비용'],
  //     '교체주기': ['교체', '최신', '신제품', '업그레이드', '중고', '성능', '기능', '모델', '신형', '구형', '새것', '오래된', '기술'],
  //     '사용패턴': ['사용', '패턴', '라이프', '생활', '이사', '가구', '주말', '매일', '자주', '가끔', '빈도', '습관', '일상', '생활방식'],
  //     '경제성': ['경제', '절약', '비교', '총비용', '전기료', '감가상각', '투자', '효율', '절약', '비용절감', '장기', '단기', '수익', '손해'],
  //     '소유권': ['소유', '내 것', '자산', '짐', '커스터마이징', '소유감', '내가', '나의', '개인', '소유물', '재산'],
  //     '최신기술': ['최신 기능', 'AI 기능', '스마트 기능', '기존 모델', '신기능', '기술', '스마트', 'AI', '자동', '편의기능'],
  //     '환경변화': ['이사', '해외', '전세', '자가', '환경', '변화', '상황', '계획', '미래', '위치', '장소']
  //   };

  //   const answeredTopics = new Set();
    
  //   userResponses.forEach(response => {
  //     const content = response.content.toLowerCase();
      
  //     Object.entries(topicKeywords).forEach(([topic, keywords]) => {
  //       const matchedKeywords = keywords.filter(keyword => {
  //         const regex = new RegExp(`\\b${keyword}\\b`, 'i');
  //         return regex.test(content);
  //       });
        
  //       if (matchedKeywords.length > 0) {
  //         answeredTopics.add(topic);
  //       }
  //     });
  //   });
    
  //   return Array.from(answeredTopics);
  // }

  getSuggestedTopics(exploredTopics, unansweredTopics = [], conversationHistory = []) {
    const topicMapping = {
      '초기 비용 부담': '초기비용',
      '케어 서비스 필요성': '케어서비스',
      '제품 교체 주기': '교체주기',
      '사용 패턴과 라이프스타일': '사용패턴',
      '장기 경제성': '경제성',
      '소유권의 가치': '소유권',
      '최신 기술 선호도': '최신기술',
      '이사나 환경 변화 가능성': '환경변화'
    };

    const allTopics = Object.keys(topicMapping);
    
    // 답변하지 않은 주제를 우선적으로 제안
    const unansweredTopicNames = unansweredTopics.map(topicKey => {
      return Object.keys(topicMapping).find(name => topicMapping[name] === topicKey);
    }).filter(Boolean);
    
    if (unansweredTopicNames.length > 0) {
      return unansweredTopicNames.slice(0, 2);
    }
    
    // Filter out topics that have already been explored
    const unexploredTopics = allTopics.filter(topic => {
      const topicKey = topicMapping[topic];
      return !exploredTopics.has(topicKey);
    });

    // If all topics are explored, return some core topics to continue conversation
    if (unexploredTopics.length === 0) {
      // 사용자 응답이 적을 때는 더 구체적인 질문을 하기 위해 특정 주제 반환
      const userResponses = this.getUserResponsesFromHistory(conversationHistory);
      if (userResponses.length <= 1) {
        return ['사용 패턴과 라이프스타일', '초기 비용 부담'];
      }
      return ['초기 비용 부담', '장기 경제성', '사용 패턴과 라이프스타일'];
    }

    return unexploredTopics.slice(0, 3);
  }

  async generateQuickResponses(conversationHistory, exploredTopics, unansweredTopics, currentQuestion = null) {
    try {
      // 현재 생성 중인 안내봇 질문이 있으면 그것을 사용, 없으면 대화 기록에서 찾기
      let lastModeratorQuestion = currentQuestion;
      
      if (!lastModeratorQuestion) {
        // 대화 기록을 역순으로 검색하여 가장 최근의 안내봇 질문 찾기
        console.log('[MODERATOR] 대화 기록 전체 검색 시작...');
        for (let i = conversationHistory.length - 1; i >= 0; i--) {
          const msg = conversationHistory[i];
          console.log(`[MODERATOR] 인덱스 ${i}: ${msg.agent} - ${msg.content.substring(0, 30)}...`);
          if (msg.agent === '안내봇') {
            lastModeratorQuestion = msg;
            console.log(`[MODERATOR] 안내봇 질문 발견! 인덱스: ${i}`);
            break;
          }
        }
      } else {
        console.log('[MODERATOR] 현재 생성 중인 질문 사용:', lastModeratorQuestion.substring(0, 50) + '...');
      }
      
      if (!lastModeratorQuestion) {
        // 안내봇 질문이 없으면 기본 응답 반환
        console.log('[MODERATOR] 안내봇 질문을 찾을 수 없음');
        return ['더 자세히 알아보고 싶어요', '다른 옵션도 있나요?'];
      }
      
      // 질문 내용 추출 (문자열이면 그대로, 객체면 content 속성 사용)
      const questionContent = typeof lastModeratorQuestion === 'string' 
        ? lastModeratorQuestion 
        : lastModeratorQuestion.content;
      
      console.log('[MODERATOR] 전체 대화 기록 길이:', conversationHistory.length);
      console.log('[MODERATOR] 최근 3개 메시지:');
      conversationHistory.slice(-3).forEach((msg, idx) => {
        console.log(`  ${conversationHistory.length - 3 + idx}: ${msg.agent} - ${msg.content.substring(0, 50)}...`);
      });
      console.log('[MODERATOR] 사용할 안내봇 질문:', questionContent);
      
      const messages = [{
        role: 'user',
        content: `안내봇이 방금 한 질문: "${questionContent}"

이 질문에 대해 사용자가 어떻게 답변할지 예상하여 정확히 2가지 응답 옵션만 생성해주세요.

규칙:
- 구매나 구독에 대한 선호도를 드러내지 말고 사용자의 예상되는 상황에 대해서만 작성하세요
- 자연스러운 대화체로 작성하세요
- 각 응답은 1마디로 아주 짧게 작성하세요
- 정확히 2개의 응답만 생성하세요

응답 형식 (반드시 이 형식을 따라주세요):
1. [첫 번째 응답]
2. [두 번째 응답]

예시:
1. 비용이 부담스러워요
2. 성능이 중요해요`
      }];

      const systemPrompt = `당신은 사용자의 구매/구독 결정을 돕는 AI 어시스턴트입니다.
안내봇의 질문에 대해 사용자가 어떻게 답변할지 예상하여 정확히 2가지 응답 옵션만 생성해주세요.

규칙:
- 구매나 구독에 대한 선호도를 드러내지 말고 중립적인 응답으로 작성하세요
- 구체적이고 명확한 상황이나 선호도를 표현하세요
- 자연스럽고 개인적인 상황을 반영한 응답으로 작성하세요
- 정확히 2개의 응답만 생성하세요
- 반드시 "1. [응답]" "2. [응답]" 형식으로만 작성하세요`;

      const response = await this.generateResponse(messages, systemPrompt, 0.3);
      
      if (response.error) {
        console.error('Quick responses generation error:', response.error);
        // 에러 시 기본 응답 반환
        return ['더 자세히 알아보고 싶어요', '다른 옵션도 있나요?'];
      }

      // 응답에서 번호가 있는 줄들을 추출 (더 유연한 파싱)
      const lines = response.content.split('\n').filter(line => line.trim());
      const responses = [];
      
      for (const line of lines) {
        // 다양한 번호 형식 지원: "1.", "1)", "-", "•" 등
        const match = line.match(/^[\d\-\•]\s*(.+)$/) || line.match(/^\d+[\.\)]\s*(.+)$/);
        if (match) {
          let content = match[1].trim();
          // 앞에 점이 남아있으면 제거
          if (content.startsWith('.')) {
            content = content.substring(1).trim();
          }
          if (content && content.length > 0) {
            responses.push(content);
          }
        }
      }

      // 파싱이 실패한 경우 더 강력한 파싱 시도
      if (responses.length < 2) {
        console.log('[MODERATOR] 파싱 실패, 강력한 파싱 시도:', response.content);
        
        // 숫자로 시작하는 모든 줄 찾기
        const numberLines = lines.filter(line => /^\d+/.test(line.trim()));
        for (const line of numberLines) {
          let content = line.replace(/^\d+[\.\)\s]*/, '').trim();
          // 앞에 점이 남아있으면 제거
          if (content.startsWith('.')) {
            content = content.substring(1).trim();
          }
          if (content && content.length > 0 && !responses.includes(content)) {
            responses.push(content);
          }
        }
        
        // 대시나 불릿으로 시작하는 줄 찾기
        const bulletLines = lines.filter(line => /^[\-\•]\s/.test(line.trim()));
        for (const line of bulletLines) {
          const content = line.replace(/^[\-\•]\s*/, '').trim();
          if (content && content.length > 0 && !responses.includes(content)) {
            responses.push(content);
          }
        }
      }

      // 2개의 응답이 있으면 반환
      if (responses.length >= 2) {
        return responses.slice(0, 2);
      } 
      
      // 1개만 있으면 추가로 생성
      if (responses.length === 1) {
        const additionalResponses = [
          '더 자세히 알아보고 싶어요',
          '다른 옵션도 있나요?',
          '비용이 걱정돼요',
          '성능이 중요해요',
          '사용빈도가 높아요',
          '케어서비스가 필요해요'
        ];
        const randomResponse = additionalResponses[Math.floor(Math.random() * additionalResponses.length)];
        return [responses[0], randomResponse];
      }
      
      // 파싱 실패 시 더 구체적인 기본 응답들
      const fallbackResponses = [
        ['비용이 부담스러워요', '장기적으로 경제적인 게 중요해요'],
        ['케어서비스가 필요해요', '최신기술을 원해요'],
        ['사용빈도가 높아요', '가끔씩만 쓸 것 같아요'],
        ['이사할 가능성이 있어요', '안정적으로 쓸 것 같아요'],
        ['AS가 걱정돼요', '성능이 중요해요'],
        ['환경변화가 있을 수 있어요', '지금 상황이 중요해요']
      ];
      const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
      return fallbackResponses[randomIndex];

    } catch (error) {
      console.error('generateQuickResponses error:', error);
      return ['더 자세히 알아보고 싶어요', '다른 옵션도 있나요?'];
    }
  }
}

export default ModeratorAgent;