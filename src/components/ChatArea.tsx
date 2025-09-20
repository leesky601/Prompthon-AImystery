'use client';

import React, { useRef } from 'react';
import { MessageCircle, ShoppingCart, Package, User, Info, Tag, Calendar, CreditCard, CheckCircle, Send, Loader2 } from 'lucide-react';

interface Message {
  agent: string;
  role: string;
  content: string;
  timestamp: string;
  quickResponses?: string[];
}

interface DetailedProductInfo {
  id: string;
  이름: string;
  설명: string;
  구매가격정보: number;
  구독가격_3년: number | null;
  구독가격_4년: number | null;
  구독가격_5년: number | null;
  구독가격_6년: number | null;
  구독장점: string[];
  케어서비스빈도: string;
  케어서비스유형: string[];
  케어서비스설명: string;
  케어서비스가격정보: string;
  image?: string;
}

interface ChatAreaProps {
  messages: Message[];
  isTyping: boolean;
  typingAgent: string;
  clickedButtons: Map<number, Set<string>>;
  isLoading: boolean;
  isInitializing: boolean;
  conversationState: string;
  detailedProduct: DetailedProductInfo | null;
  onQuickResponse: (response: string, messageIndex: number) => void;
  onSend: (text: string) => void;
  fullScreen: boolean;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
}


// 중요 키워드를 하이라이팅하는 함수
const highlightKeywords = (content: string) => {
  const keywords = [
    '구매', '구매 비용', '교체 가능', '구독', '구독 취소', '최신 TV', '용도', '구독료', '장기 경제성', '일시불', '소유권', '소유', '소유감', '내 소유', '자산', '케어서비스', '케어 서비스','구독 시', '구매 시', '6년 구독', '5년 구독', '4년 구독', '3년 구독',
    'LG 트롬 오브제컬렉션 건조기', 'QNED TV', 'LG 퓨리케어 오브제컬렉션 정수기', 'LG 휘센 오브제컬렉션 쿨 에어컨 2in1', 'LG QNED TV (벽걸이형)', 'LG QNED TV', '자가관리',
    'AS', '관리', '점검', '고장', '고장 걱정', '공식 케어센터', '보증', '교체', '업그레이드', '경제적', '이득', '절약', '필터', '추가 비용', '포인트', '카드할인', '선결제 할인', '서비스 종료', '기성비', '장기적', '구독 중단', '무상 수리', '구매봇', '구독봇', '안내봇', 'LG 가전',
    '비교', '총비용', '전기료', '비용 절감', '가격', '가격 변동', '마음 편히', '신제품', '최신', '최신 기술', '최신 기능','중고', '성능', '선호도', '초기 비용', '초기 부담', '할인 혜택',
    '사용 빈도', '사용 패턴', '라이프스타일', '저렴', '멤버십 포인트', '생활 방식', '이사', '위약금', '중간 해지', '해지', '이사 계획', '사용 환경', '환경 변화', '가구', 'LG전자', 'LG가전', '가전제품', '제품', '모델', '기능', '서비스', 'LG'
  ];
  
  let result: (string | JSX.Element)[] = [content];
  
  // 키워드를 길이 순으로 정렬 (긴 키워드부터 처리하여 중복 매칭 방지)
  const sortedKeywords = keywords.sort((a, b) => b.length - a.length);
  
  sortedKeywords.forEach(keyword => {
    const newResult: (string | JSX.Element)[] = [];
    
    result.forEach(item => {
      if (typeof item === 'string') {
        // 키워드에 특수문자가 있을 수 있으므로 이스케이프 처리
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const parts = item.split(new RegExp(`(${escapedKeyword})`, 'gi'));
        parts.forEach((part, index) => {
          if (part.toLowerCase() === keyword.toLowerCase()) {
            newResult.push(
              <strong key={`${keyword}-${index}`} className="font-bold text-yellow-200">
                {part}
              </strong>
            );
          } else if (part) {
            newResult.push(part);
          }
        });
      } else {
        newResult.push(item);
      }
    });
    
    result = newResult;
  });
  
  return result;
};

const parseConclusionMessage = (content: string) => {
  // 최종 결론 메시지를 파싱하여 구조화된 형태로 변환
  const conclusionMatch = content.match(/\[최종 결론\]:\s*([^[]+)/);
  const suitabilityMatch = content.match(/\[적합도\]:\s*([^[]+)/);
  const reasonsMatch = content.match(/\[핵심 근거 3줄\]:\s*([^[]+)/);
  const nextStepMatch = content.match(/\[다음 단계 제안 1줄\]:\s*([^[]+)/);
  
  const recommendation = conclusionMatch ? conclusionMatch[1].trim() : '';
  const suitability = suitabilityMatch ? suitabilityMatch[1].trim() : '';
  const reasonsText = reasonsMatch ? reasonsMatch[1].trim() : '';
  const nextStep = nextStepMatch ? nextStepMatch[1].trim() : '';
  
  // "- "로 시작하는 항목들을 분리
  const reasons = reasonsText ? reasonsText.split(/\s*-\s+/).filter(r => r.trim()).map(r => r.trim()) : [];
  
  return (
    <div className="conclusion-message">
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-3 mb-2">
        <div className="flex items-center mb-2">
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-2">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-base font-bold text-red-800">최종 결론</h3>
        </div>
        
        {/* 추천 결과 */}
        <div className="bg-white rounded-lg p-3 mb-3 border border-red-100">
          <div className="flex items-center mb-1">
            <Tag className="w-3 h-3 text-red-600 mr-1" />
            <span className="text-sm font-semibold text-red-700">추천 결과</span>
          </div>
          <div className="text-sm text-red-800 font-medium">
            {(() => {
              if (recommendation.includes('구매')) {
                return (
                  <div className="flex items-center">
                    <ShoppingCart className="w-4 h-4 mr-1 text-blue-600" />
                    <span><strong>구매를 추천합니다</strong></span>
                  </div>
                );
              } else if (recommendation.includes('구독')) {
                return (
                  <div className="flex items-center">
                    <CreditCard className="w-4 h-4 mr-1 text-green-600" />
                    <span><strong>구독을 추천합니다</strong></span>
                  </div>
                );
              } else {
                return <span><strong>{recommendation || '결론을 분석 중...'}</strong></span>;
              }
            })()}
          </div>
        </div>

        {/* 적합도 */}
        {suitability && (
          <div className="bg-white rounded-lg p-3 mb-3 border border-red-100">
            <div className="flex items-center mb-1">
              <Info className="w-3 h-3 text-blue-600 mr-1" />
              <span className="text-sm font-semibold text-blue-700">적합도 분석</span>
            </div>
            <div className="text-sm text-blue-800 font-medium">
              <strong>{suitability}</strong>
            </div>
          </div>
        )}

        {/* 핵심 근거 */}
        {reasons.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center mb-1">
              <Info className="w-3 h-3 text-blue-600 mr-1" />
              <span className="text-sm font-semibold text-gray-700">핵심 근거</span>
            </div>
            
            {reasons.map((reason, idx) => (
              <div key={idx} className="flex items-start bg-white rounded-lg p-2 border border-gray-100">
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                  <span className="text-red-600 font-bold text-xs">{idx + 1}</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed"><strong>{reason}</strong></p>
              </div>
            ))}
          </div>
        )}

        {/* 다음 단계 제안 및 액션 버튼 */}
        {nextStep && (
          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Calendar className="w-3 h-3 text-yellow-600 mr-1" />
                <span className="text-sm font-semibold text-yellow-800">다음 단계</span>
              </div>
              
              {/* 액션 버튼들 */}
              <div className="flex gap-2">
                {recommendation.includes('구매') && (
                  <button
                    onClick={() => {
                      alert('아싸 구매 고객 하나 잡았긴해!');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    구매하러 가기
                  </button>
                )}
                {recommendation.includes('구독') && (
                  <button
                    onClick={() => {
                      alert('아싸! 구독 고객 하나 추가했긴해!');
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-1"
                  >
                    <CreditCard className="w-3 h-3" />
                    구독하러 가기
                  </button>
                )}
                {!recommendation.includes('구매') && !recommendation.includes('구독') && (
                  <button
                    onClick={() => {
                      // 상품 상세 페이지로 이동
                      if (detailedProduct) {
                        window.open(`/product/${detailedProduct.id}`, '_blank');
                      }
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors flex items-center gap-1"
                  >
                    <Package className="w-3 h-3" />
                    상품 자세히 보기
                  </button>
                )}
              </div>
            </div>
            <p className="text-yellow-700 text-xs">
              <strong>{nextStep}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const getAgentIcon = (agent: string) => {
  switch (agent) {
    case '구매봇':
      return (
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-sky-300">
          <img src="/images/purchase-bot.jpeg" alt="구매봇" className="w-full h-full object-cover" />
        </div>
      );
    case '구독봇':
      return (
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-green-300">
          <img src="/images/subscription-bot.png" alt="구독봇" className="w-full h-full object-cover" />
        </div>
      );
    case '안내봇':
      return (
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-400">
          <img src="/images/guide-bot.jpeg" alt="안내봇" className="w-full h-full object-cover" />
        </div>
      );
    case '사용자':
      return (
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-blue-300">
          <img src="/images/user.png" alt="사용자" className="w-full h-full object-cover" />
        </div>
      );
    default:
      return <MessageCircle className="w-5 h-5" />;
  }
};

const ChatArea: React.FC<ChatAreaProps> = ({ 
  messages, 
  isTyping, 
  typingAgent,
  clickedButtons, 
  isLoading, 
  isInitializing,
  conversationState, 
  detailedProduct, 
  onQuickResponse, 
  onSend, 
  fullScreen,
  messagesContainerRef 
}) => {
  const localRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);
  const [canSend, setCanSend] = React.useState(false);

  const handleSend = () => {
    if (!localRef.current) return;
    const value = localRef.current.value.trim();
    if (!value) return;
    onSend(value);
    localRef.current.value = '';
    setCanSend(false);
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Messages Container */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-0 relative" style={{ scrollBehavior: 'auto' }}>
        {/* Welcome Background Message - 절대 위치로 배경에 표시 */}
        {conversationState === 'welcome' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <div className="text-gray-400 text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">채팅을 시작해보세요!</p>
            </div>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={`${message.timestamp || Date.now()}-${index}`}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} relative z-10`}
          >
            <div className={`flex items-start space-x-3 ${
              message.agent === '안내봇' && (message.content.includes('최종 결론') || message.content.includes('[최종 결론]'))
                ? 'max-w-[90%]'
                : 'max-w-[70%]'
            } ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className="flex-shrink-0">
                {getAgentIcon(message.agent)}
              </div>
              <div>
                <div className={`text-sm font-semibold mb-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                  {message.agent}
                </div>
                <div className={`p-4 rounded-2xl shadow-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.agent === '구매봇'
                      ? 'bg-sky-500 text-white'
                      : message.agent === '구독봇'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-800 text-white'
                }`}>
                  {message.agent === '안내봇' && (message.content.includes('최종 결론') || message.content.includes('[최종 결론]')) ? (
                    <div className="space-y-4">
                      {parseConclusionMessage(message.content)}
                    </div>
                  ) : message.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <p className="whitespace-pre-wrap">{highlightKeywords(message.content)}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Quick Responses - 전체 채팅 영역 오른쪽에 배치 */}
        {messages.length > 0 && messages[messages.length - 1].quickResponses && messages[messages.length - 1].quickResponses!.length > 0 && (
          <div className="flex justify-end mb-4">
            <div className="flex flex-wrap gap-3">
              {messages[messages.length - 1].quickResponses!.map((response, idx) => {
                const lastMessageIndex = messages.length - 1;
                const messageClickedButtons = clickedButtons.get(lastMessageIndex) || new Set();
                if (messageClickedButtons.has('all_buttons_clicked')) {
                  return null;
                }

                const isStartButton = response === '시작하자';
                const isConclusionButton = response === '이제 결론을 내줘';
                
                return (
                  <button
                    key={idx}
                    onClick={() => onQuickResponse(response, lastMessageIndex)}
                    disabled={isLoading}
                    className={`disabled:opacity-50 disabled:cursor-not-allowed ${isStartButton ? 'animate-pulse' : ''}`}
                    style={{
                      background: isConclusionButton 
                        ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.95), rgba(124, 58, 237, 0.9))'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9))',
                      border: isConclusionButton 
                        ? '2px solid rgba(147, 51, 234, 0.8)'
                        : '2px solid rgba(165, 0, 52, 0.15)',
                      borderRadius: '12px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      color: isConclusionButton ? '#ffffff' : '#1d1d1f',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'center',
                      width: 'auto',
                      minWidth: 'fit-content',
                      maxWidth: '240px',
                      fontWeight: isConclusionButton ? '700' : '500',
                      boxShadow: isStartButton 
                        ? '0 4px 16px rgba(165, 0, 52, 0.4)' 
                        : isConclusionButton
                          ? '0 4px 16px rgba(147, 51, 234, 0.6)'
                          : '0 2px 8px rgba(165, 0, 52, 0.1)',
                      backdropFilter: 'blur(10px)',
                      position: 'relative',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      animation: isStartButton ? 'sparkle 1.5s ease-in-out infinite' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (isConclusionButton) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(124, 58, 237, 0.95), rgba(109, 40, 217, 0.9))';
                        e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 1)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(147, 51, 234, 0.8)';
                      } else {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(165, 0, 52, 0.08), rgba(165, 0, 52, 0.05))';
                        e.currentTarget.style.borderColor = 'rgba(165, 0, 52, 0.3)';
                        e.currentTarget.style.color = '#A50034';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = isStartButton 
                          ? '0 8px 24px rgba(165, 0, 52, 0.5)' 
                          : '0 8px 24px rgba(165, 0, 52, 0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isConclusionButton) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(147, 51, 234, 0.95), rgba(124, 58, 237, 0.9))';
                        e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.8)';
                        e.currentTarget.style.transform = 'translateY(0px)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(147, 51, 234, 0.6)';
                      } else {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9))';
                        e.currentTarget.style.borderColor = 'rgba(165, 0, 52, 0.15)';
                        e.currentTarget.style.color = '#1d1d1f';
                        e.currentTarget.style.transform = 'translateY(0px)';
                        e.currentTarget.style.boxShadow = isStartButton 
                          ? '0 4px 16px rgba(165, 0, 52, 0.4)' 
                          : '0 2px 8px rgba(165, 0, 52, 0.1)';
                      }
                    }}
                  >
                    {response}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Typing Indicator with Avatar */}
        {(isTyping || isInitializing) && (() => {
          // 다음에 채팅할 봇 예측 (백엔드 로직과 동일하게)
          const getNextAgent = () => {
            if (messages.length === 0) return '안내봇'; // 첫 번째는 안내봇
            
            // 마지막 사용자 메시지 이후의 봇 대화 횟수 계산
            const userMessages = messages.filter(msg => msg.agent === '사용자');
            const lastUserMessageIndex = messages.findLastIndex(msg => msg.agent === '사용자');
            
            if (lastUserMessageIndex === -1) return '안내봇';
            
            // 마지막 사용자 메시지 이후의 봇 메시지들
            const messagesAfterLastUser = messages.slice(lastUserMessageIndex + 1);
            const botMessagesAfterUser = messagesAfterLastUser.filter(msg => msg.agent !== '사용자');
            
            // "이제 결론을 내줘" 버튼을 누른 직후는 무조건 안내봇
            const lastUserMessage = messages[lastUserMessageIndex];
            if (lastUserMessage && lastUserMessage.content === '이제 결론을 내줘' && botMessagesAfterUser.length === 0) {
              return '안내봇';
            }
            
            // "시작하자" 버튼을 누른 직후는 특별히 구매봇이 먼저
            if (lastUserMessage && lastUserMessage.content === '시작하자' && botMessagesAfterUser.length === 0) {
              return '구매봇';
            }
            
            const debateTurnCount = userMessages.length;
            const isOddTurn = debateTurnCount % 2 === 1;
            
            if (isOddTurn) {
              // 홀수 턴: 구매봇 → 구독봇
              if (botMessagesAfterUser.length === 0) return '구매봇';
              if (botMessagesAfterUser.length === 1) return '구독봇';
              return '안내봇'; // 다음은 안내봇
            } else {
              // 짝수 턴: 구독봇 → 구매봇
              if (botMessagesAfterUser.length === 0) return '구독봇';
              if (botMessagesAfterUser.length === 1) return '구매봇';
              return '안내봇'; // 다음은 안내봇
            }
          };
          
          const nextAgent = getNextAgent();
          
          return (
            <div className="flex items-start space-x-3 mb-4 relative z-10">
              <div className="flex-shrink-0">
                {getAgentIcon(nextAgent)}
              </div>
              <div>
                <div className="text-sm font-semibold mb-1 text-gray-700">
                  {nextAgent}
                </div>
                <div className="flex items-center space-x-2 text-gray-500">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm">
                    {isInitializing ? '작성 중...' : '입력 중...'}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Input Area */}
      <div 
        className={`p-0 ${fullScreen ? '' : 'rounded-b-lg'}`}
        style={{
          padding: '4px 16px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95))',
          borderTop: '2px solid rgba(165, 0, 52, 0.1)',
          boxSizing: 'border-box',
          backdropFilter: 'blur(25px)',
          boxShadow: '0 -4px 20px rgba(165, 0, 52, 0.1)'
        }}
      >
        <div className="flex gap-3 items-center p-2">
          <input
            ref={localRef}
            type="text"
            onChange={(e) => {
              setCanSend(e.currentTarget.value.trim().length > 0);
            }}
            onCompositionStart={() => { isComposingRef.current = true; }}
            onCompositionEnd={(e) => { isComposingRef.current = false; setCanSend(e.currentTarget.value.trim().length > 0); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isComposingRef.current && !isLoading && conversationState !== 'conclusion') {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={conversationState === 'conclusion' ? '대화가 종료되었습니다' : (conversationState === 'welcome' ? '아래 "시작하자" 버튼을 눌러주세요' : '마음에 드는 답변이 없다면 직접 답변을 입력해보세요!')}
            disabled={isLoading || conversationState === 'conclusion' || conversationState === 'welcome' || conversationState === 'initial_debate'}
            className="flex-1 text-sm outline-none disabled:text-gray-500 disabled:cursor-not-allowed"
            style={{
              padding: '14px 18px',
              border: '2px solid rgba(165, 0, 52, 0.15)',
              borderRadius: '24px',
              fontSize: '15px',
              transition: 'all 0.3s ease',
              background: (isLoading || conversationState === 'conclusion' || conversationState === 'welcome' || conversationState === 'initial_debate')
                ? 'linear-gradient(135deg, rgba(240, 240, 240, 0.95), rgba(220, 220, 220, 0.9))'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9))',
              backdropFilter: 'blur(15px)',
              boxShadow: '0 2px 8px rgba(165, 0, 52, 0.1)'
            }}
            autoComplete="off"
            autoFocus={conversationState !== 'welcome' && conversationState !== 'conclusion'}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !canSend || conversationState === 'conclusion' || conversationState === 'welcome' || conversationState === 'initial_debate'}
            className="px-5 py-3 text-white rounded-full font-semibold disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-1 whitespace-nowrap overflow-hidden text-ellipsis w-[80px] h-[48px] flex items-center justify-center shadow-lg hover:shadow-xl"
            style={{
              background: (isLoading || conversationState === 'conclusion' || conversationState === 'welcome' || conversationState === 'initial_debate')
                ? 'linear-gradient(135deg, #9CA3AF, #6B7280, #4B5563)'
                : 'linear-gradient(135deg, #A50034, #8B0028, #6B0018)'
            }}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <div className="flex items-center">
                <Send className="w-5 h-5" />
                <span className="hidden sm:inline ml-2">전송</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
