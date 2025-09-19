'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { X, Loader2, MessageCircle, ShoppingCart, Package, User, ChevronLeft, ChevronRight, Info, Tag, Calendar, CreditCard, CheckCircle, Wrench } from 'lucide-react';
import productsData from '../data/products.json';
import detailedProductsData from '../data/detailedProducts.json';
import ChatInput from './ChatInput';

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

interface ChatbotWindowProps {
  productId?: string;
  isOpen: boolean;
  onClose: () => void;
  fullScreen?: boolean;
}

const ChatbotWindow: React.FC<ChatbotWindowProps> = ({ productId, isOpen, onClose, fullScreen = false }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationState, setConversationState] = useState('welcome');
  const [showProductInfo, setShowProductInfo] = useState(true);
  const [detailedProduct, setDetailedProduct] = useState<DetailedProductInfo | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);
  const previousScrollHeight = useRef(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  
  // Simple scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (!messagesContainerRef.current) return;
    const container = messagesContainerRef.current;
    container.scrollTop = container.scrollHeight - container.clientHeight;
  }, []);
  
  // Initialize chat function - must be defined before useEffect that uses it
  const initializeChat = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/chat/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          userData: {
            timestamp: new Date().toISOString()
          }
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSessionId(data.sessionId);
        setMessages([data.message]);
        setConversationState(data.state);
        // Ensure scroll to bottom for initial message
        shouldAutoScroll.current = true;
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setMessages([{
        agent: '시스템',
        role: 'system',
        content: '채팅을 시작할 수 없습니다. 잠시 후 다시 시도해주세요.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, productId]);

  // Initialize chat session when window opens
  useEffect(() => {
    if (isOpen && !sessionId) {
      initializeChat();
    }
  }, [isOpen, sessionId, initializeChat]);

  // Load product information when productId is provided
  useEffect(() => {
    if (productId) {
      // Find detailed product from the data
      const detailedProduct = detailedProductsData.products.find(p => p.id === productId);
      if (detailedProduct) {
        setDetailedProduct(detailedProduct as DetailedProductInfo);
      } else {
        // Fallback to basic products data if not found in detailed
        const basicProduct = productsData.bestProducts.find(p => p.id === productId);
        if (basicProduct) {
          // Create a detailed product object from basic data
          setDetailedProduct({
            id: basicProduct.id,
            이름: basicProduct.name,
            설명: basicProduct.name,
            구매가격정보: basicProduct.discountPrice,
            구독가격_3년: null,
            구독가격_4년: null,
            구독가격_5년: null,
            구독가격_6년: basicProduct.monthlyPrice || null,
            구독장점: [],
            케어서비스빈도: "",
            케어서비스유형: [],
            케어서비스설명: "",
            케어서비스가격정보: "",
            image: basicProduct.image
          });
        }
      }
    }
  }, [productId]);

  // NEW: Track scroll position before messages update
  useEffect(() => {
    if (!messagesContainerRef.current) return;
    const container = messagesContainerRef.current;
    
    // Store current scroll state BEFORE messages change
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    const isAtBottom = distanceFromBottom < 50;
    
    // Update auto-scroll flag based on current position
    shouldAutoScroll.current = isAtBottom;
    previousScrollHeight.current = container.scrollHeight;
  }, [messages.length]); // Run BEFORE messages array changes
  
  // NEW: Apply scroll after messages render
  useEffect(() => {
    if (!messagesContainerRef.current) return;
    const container = messagesContainerRef.current;
    
    // Only scroll if we should auto-scroll
    if (shouldAutoScroll.current) {
      // Use setTimeout to ensure DOM is fully updated
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 0);
      return () => clearTimeout(timer);
    } else {
      // Maintain scroll position if user was reading above
      const scrollHeightDiff = container.scrollHeight - previousScrollHeight.current;
      if (scrollHeightDiff > 0) {
        // Keep the same visual position by adjusting for new content
        container.scrollTop = container.scrollTop + scrollHeightDiff;
      }
    }
  }, [messages, scrollToBottom]);
  
  // NEW: Simple scroll event handler
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      // Update flag based on user scroll position
      shouldAutoScroll.current = distanceFromBottom < 50;
    };
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const delayForAgent = (agent?: string) => {
    switch (agent) {
      case '구매봇':
        return 600;
      case '구독봇':
        return 900;
      case '안내봇':
        return 1200;
      default:
        return 700;
    }
  };

  // Send message function
  const sendMessage = useCallback(async (message: string, messageType: string = 'text') => {
    if (!sessionId || (!message && messageType === 'text')) return;

    // Message handling

    // Add user message to chat if it's text
    if (messageType === 'text' && message) {
      const userMessage: Message = {
        agent: '사용자',
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
    }

    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message,
          messageType
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        if (data.messages && Array.isArray(data.messages)) {
          for (let i = 0; i < data.messages.length; i++) {
            const msg = data.messages[i];
            const delay = delayForAgent(msg.agent);
            await new Promise(resolve => setTimeout(resolve, delay));
            setMessages(prev => [...prev, msg]);
          }
        } else if (data.message) {
          setMessages(prev => [...prev, data.message]);
        }
        setConversationState(data.state || conversationState);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        agent: '시스템',
        role: 'system',
        content: '메시지 전송에 실패했습니다. 다시 시도해주세요.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [sessionId, conversationState]);

  const handleQuickResponse = useCallback((response: string) => {
    if (response === '시작하자') {
      sendMessage(response, 'start');
    } else {
      sendMessage(response, 'quick_response');
    }
  }, [sendMessage]);

  const getAgentIcon = useCallback((agent: string) => {
    switch (agent) {
      case '구매봇':
        return <ShoppingCart className="w-5 h-5" />;
      case '구독봇':
        return <Package className="w-5 h-5" />;
      case '안내봇':
        return <MessageCircle className="w-5 h-5" />;
      case '사용자':
        return <User className="w-5 h-5" />;
      default:
        return <MessageCircle className="w-5 h-5" />;
    }
  }, []);

  const getAgentColor = useCallback((agent: string) => {
    switch (agent) {
      case '구매봇':
        return 'bg-blue-500';
      case '구독봇':
        return 'bg-green-500';
      case '안내봇':
        return 'bg-purple-500';
      case '사용자':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  }, []);

  if (!isOpen) return null;

  const Wrapper: React.FC<{children: React.ReactNode}> = ({ children }) => {
    if (fullScreen) {
      return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col h-screen">
          {children}
        </div>
      );
    }
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
          {children}
        </div>
      </div>
    );
  };

  return (
    <Wrapper>
      {/* Header */}
      <div className={`bg-gradient-to-r from-red-600 to-red-700 text-white p-4 ${fullScreen ? '' : 'rounded-t-lg'} flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-75"></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-150"></div>
          </div>
          <h2 className="text-xl font-bold">LG 가전 구독 할래말래?</h2>
        </div>
        <div className="flex items-center space-x-2">
          {detailedProduct && (
            <button
              onClick={() => setShowProductInfo(!showProductInfo)}
              className="p-2 hover:bg-red-800 rounded-full transition-colors"
              title={showProductInfo ? '제품 정보 숨기기' : '제품 정보 보기'}
            >
              {showProductInfo ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Messages Container */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
          style={{ scrollBehavior: 'auto' }}
        >
        {messages.map((message, index) => (
          <div
            key={`${message.timestamp}-${index}`}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-[70%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`p-2 rounded-full ${getAgentColor(message.agent)} text-white`}>
                {getAgentIcon(message.agent)}
              </div>
              <div>
                <div className={`text-sm font-semibold mb-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                  {message.agent}
                </div>
                <div className={`p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white border border-gray-200'
                }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                
                {/* Quick Responses */}
                {message.quickResponses && message.quickResponses.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.quickResponses.map((response, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickResponse(response)}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          response === '이제 결론을 내줘'
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {response}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center space-x-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">입력 중...</span>
          </div>
        )}

        <div style={{ height: '1px' }} />
      </div>

      {/* Product Info Sidebar */}
      {showProductInfo && detailedProduct && (
        <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4">
            {/* Product Image */}
            {detailedProduct.image && (
              <div className="mb-4">
                <img 
                  src={detailedProduct.image} 
                  alt={detailedProduct.이름}
                  className="w-full h-48 object-contain rounded-lg bg-gray-100"
                />
              </div>
            )}

            {/* Product Title */}
            <h3 className="text-lg font-bold mb-2">{detailedProduct.이름}</h3>
            <p className="text-sm text-gray-600 mb-4">{detailedProduct.설명}</p>

            {/* Purchase vs Subscription Price Cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Purchase Card */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center mb-2">
                  <ShoppingCart className="w-4 h-4 mr-1 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900">일시불 구매</span>
                </div>
                <p className="text-xl font-bold text-blue-700">
                  {detailedProduct.구매가격정보.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600 mt-1">원</p>
              </div>

              {/* Subscription Card */}
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center mb-2">
                  <CreditCard className="w-4 h-4 mr-1 text-green-600" />
                  <span className="text-sm font-semibold text-green-900">월 구독</span>
                </div>
                <div className="text-xs space-y-1">
                  {detailedProduct.구독가격_3년 && (
                    <div className="flex justify-between">
                      <span className="text-green-700">3년</span>
                      <span className="font-semibold text-green-800">{detailedProduct.구독가격_3년.toLocaleString()}원</span>
                    </div>
                  )}
                  {detailedProduct.구독가격_4년 && (
                    <div className="flex justify-between">
                      <span className="text-green-700">4년</span>
                      <span className="font-semibold text-green-800">{detailedProduct.구독가격_4년.toLocaleString()}원</span>
                    </div>
                  )}
                  {detailedProduct.구독가격_5년 && (
                    <div className="flex justify-between">
                      <span className="text-green-700">5년</span>
                      <span className="font-semibold text-green-800">{detailedProduct.구독가격_5년.toLocaleString()}원</span>
                    </div>
                  )}
                  {detailedProduct.구독가격_6년 && (
                    <div className="flex justify-between">
                      <span className="text-green-700">6년</span>
                      <span className="font-semibold text-green-800">{detailedProduct.구독가격_6년.toLocaleString()}원</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Subscription Benefits */}
            {detailedProduct.구독장점 && detailedProduct.구독장점.length > 0 && (
              <div className="mb-4 bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg">
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                  <span className="text-sm font-semibold">구독 혜택</span>
                </div>
                <ul className="space-y-2">
                  {detailedProduct.구독장점.map((benefit, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 mr-2 mt-0.5">•</span>
                      <span className="text-xs text-gray-700 leading-relaxed">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Care Service Info */}
            {detailedProduct.케어서비스설명 && detailedProduct.케어서비스설명 !== "" && (
              <div className="mb-4 bg-purple-50 p-3 rounded-lg">
                <div className="flex items-center mb-2">
                  <Wrench className="w-4 h-4 mr-1 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-900">케어 서비스</span>
                </div>
                <p className="text-xs text-purple-700 mb-2">{detailedProduct.케어서비스설명}</p>
                
                {detailedProduct.케어서비스빈도 && (
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-purple-800">방문 주기:</span>
                    <span className="text-xs text-purple-600 ml-1">{detailedProduct.케어서비스빈도}</span>
                  </div>
                )}
                
                {detailedProduct.케어서비스유형 && detailedProduct.케어서비스유형.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-purple-800">서비스 유형:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {detailedProduct.케어서비스유형.map((type, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {detailedProduct.케어서비스가격정보 && detailedProduct.케어서비스가격정보 !== "없음" && (
                  <div className="pt-2 border-t border-purple-200">
                    <span className="text-xs font-semibold text-purple-800">가격 정보:</span>
                    <p className="text-xs text-purple-600 mt-1">{detailedProduct.케어서비스가격정보}</p>
                  </div>
                )}
              </div>
            )}

            {/* Total Cost Comparison */}
            <div className="p-3 bg-gray-100 rounded-lg">
              <h4 className="text-sm font-semibold mb-3 text-gray-800">총 비용 비교 (6년 기준)</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">일시불 구매</span>
                  <span className="text-sm font-bold text-gray-800">
                    {detailedProduct.구매가격정보.toLocaleString()}원
                  </span>
                </div>
                {detailedProduct.구독가격_6년 && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">6년 구독 기본 총액</span>
                      <span className="text-sm text-gray-700">
                        {(detailedProduct.구독가격_6년 * 72).toLocaleString()}원
                      </span>
                    </div>
                    
                    {/* Calculate subscription with benefits */}
                    {(() => {
                      const basicTotal = detailedProduct.구독가격_6년 * 72;
                      let finalTotal = basicTotal;
                      let appliedBenefits: string[] = [];
                      
                      // Parse benefits to calculate actual final cost
                      detailedProduct.구독장점.forEach(benefit => {
                        // Check for card discount
                        if (benefit.includes('제휴카드 할인')) {
                          const match = benefit.match(/월\s*([\d,]+)원/);
                          if (match) {
                            const monthlyDiscount = parseInt(match[1].replace(/,/g, ''));
                            finalTotal -= monthlyDiscount * 72;
                            appliedBenefits.push(`카드할인: -${(monthlyDiscount * 72).toLocaleString()}원`);
                          }
                        }
                        
                        // Check for prepayment discount
                        if (benefit.includes('선 결제') && benefit.includes('추가 할인')) {
                          const match = benefit.match(/월\s*([\d,]+)원\s*추가\s*할인/);
                          if (match) {
                            const monthlyDiscount = parseInt(match[1].replace(/,/g, ''));
                            finalTotal -= monthlyDiscount * 72;
                            appliedBenefits.push(`선결제 할인: -${(monthlyDiscount * 72).toLocaleString()}원`);
                          }
                        }
                        
                        // Check for membership points
                        if (benefit.includes('멤버십 포인트')) {
                          const match = benefit.match(/([\d,]+)P/);
                          if (match) {
                            const points = parseInt(match[1].replace(/,/g, ''));
                            finalTotal -= points;
                            appliedBenefits.push(`포인트: -${points.toLocaleString()}원`);
                          }
                        }
                        
                        // Check for first year discount
                        if (benefit.includes('첫 12개월') && benefit.includes('반값') && detailedProduct.구독가격_6년) {
                          const halfYearDiscount = detailedProduct.구독가격_6년 * 6;
                          finalTotal -= halfYearDiscount;
                          appliedBenefits.push(`첫년 반값: -${halfYearDiscount.toLocaleString()}원`);
                        }
                        
                        // Check if total cost is mentioned in benefit
                        if (benefit.includes('총 비용')) {
                          const match = benefit.match(/총\s*비용\s*([\d,]+)원/);
                          if (match) {
                            finalTotal = parseInt(match[1].replace(/,/g, ''));
                          }
                        }
                      });
                      
                      return (
                        <>
                          {appliedBenefits.length > 0 && (
                            <div className="pl-3 space-y-1 text-xs text-gray-500 italic">
                              {appliedBenefits.map((benefit, idx) => (
                                <div key={idx}>{benefit}</div>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center bg-green-100 p-2 rounded">
                            <span className="text-xs font-semibold text-green-800">혜택 적용 최종가</span>
                            <span className="text-sm font-bold text-green-700">
                              {finalTotal.toLocaleString()}원
                            </span>
                          </div>
                          
                          <div className="pt-2 mt-2 border-t border-gray-300">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-semibold text-gray-700">구매 대비 차액</span>
                              <span className={`text-sm font-bold ${
                                finalTotal > detailedProduct.구매가격정보 
                                  ? 'text-red-600' 
                                  : 'text-green-600'
                              }`}>
                                {Math.abs(finalTotal - detailedProduct.구매가격정보).toLocaleString()}원
                                {finalTotal > detailedProduct.구매가격정보 
                                  ? ' 더 비쌈' 
                                  : ' 절약'}
                              </span>
                            </div>
                            {finalTotal <= detailedProduct.구매가격정보 && (
                              <div className="mt-2 p-2 bg-green-50 rounded">
                                <p className="text-xs text-green-700 font-medium text-center">
                                  ✨ 최대 할인 적용 시 구독이 더 경제적입니다!
                                </p>
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Input Area */}
      <div className={`border-t bg-white p-4 ${fullScreen ? '' : 'rounded-b-lg'}`}>
        <ChatInput
          onSendMessage={sendMessage}
          isLoading={isLoading}
          conversationState={conversationState}
        />
        {conversationState === 'welcome' && (
          <div className="mt-3 flex justify-center">
            <button
              onClick={() => handleQuickResponse('시작하자')}
              disabled={isLoading}
              className="px-8 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 disabled:opacity-50"
            >
              시작하자
            </button>
          </div>
        )}
      </div>
    </Wrapper>
  );
};

export default ChatbotWindow;
