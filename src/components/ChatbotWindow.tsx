'use client';

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import productsData from '../data/products.json';
import detailedProductsData from '../data/detailedProducts.json';
import ChatArea from './ChatArea';
import ProductSidebar from './ProductSidebar';

// 카카오톡 음악 재생 함수
const playKakaoSound = () => {
  try {
    const audio = new Audio('/카카오톡 슉8.mp3');
    audio.volume = 0.5; // 볼륨 조절
    audio.play().catch(error => {
      console.log('Kakao sound playback failed:', error);
    });
  } catch (error) {
    console.log('Kakao sound not supported:', error);
  }
};

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
  const [typingAgent, setTypingAgent] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [conversationState, setConversationState] = useState('welcome');
  const [showProductInfo, setShowProductInfo] = useState(true);
  const [detailedProduct, setDetailedProduct] = useState<DetailedProductInfo | null>(null);
  const [clickedButtons, setClickedButtons] = useState<Map<number, Set<string>>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  // 한글 IME 조합 여부만 추적 (이중 상태 제거: compositionValue 삭제)
  // 입력은 별도 ChatInput 컴포넌트에서 비제어로 관리 (IME 안정성)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  // Initialize chat session when window opens (only once)
  useEffect(() => {
    if (isOpen && !isInitialized) {
      setIsInitializing(true);
      // 약간의 지연 후 채팅 초기화 (인디케이터를 먼저 보여주기 위해)
      setTimeout(() => {
      initializeChat();
      }, 1000);
      setIsInitialized(true);
    }
  }, [isOpen, isInitialized]);

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

  // 스트리밍 중에도 항상 하단 고정 (페인트 전에 적용)
  useLayoutEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const id = requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
    return () => cancelAnimationFrame(id);
  }, [messages, isTyping, isInitializing]);

  // 새로운 메시지 추가 시 사운드만 재생
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage) {
        playKakaoSound();
      }
    }
  }, [messages]);

  // Focus management for input field
  useEffect(() => {
    if (!isLoading && conversationState !== 'conclusion' && conversationState !== 'welcome' && inputRef.current) {
      const timer = setTimeout(() => {
        if (inputRef.current && document.activeElement !== inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [conversationState, isLoading]);

  const initializeChat = async () => {
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
      setIsInitializing(false);
    }
  };

  const restartChat = async () => {
    // 모든 상태 완전 초기화
    setMessages([]);
    setSessionId(null);
    setIsLoading(false);
    setIsTyping(false);
    setTypingAgent('');
    setConversationState('welcome');
    setClickedButtons(new Map());
    setIsInitializing(true);
    
    // 약간의 지연 후 새 채팅 시작 (인디케이터를 먼저 보여주기 위해)
    setTimeout(async () => {
      await initializeChat();
    }, 1000);
  };

  // No delay needed - server handles timing with streaming

  const sendMessage = async (message: string, messageType: string = 'text') => {
    if (!sessionId || (!message && messageType === 'text')) return;

    // Clear input if it's a text message
    // (비제어 입력이라 여기서 별도 clear 불필요)

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
      const response = await fetch(`${API_URL}/api/chat/message/stream`, {
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() && line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6).trim();
                if (jsonStr) {
                  const data = JSON.parse(jsonStr);
                  
                  if (data.type === 'message') {
                    // 최종 메시지를 스트림 누적 메시지와 병합(중복 방지)
                    setMessages(prev => {
                      const lastMessage = prev[prev.length - 1];
                      if (lastMessage && lastMessage.agent === data.data.agent && lastMessage.role === 'assistant') {
                        const updated = [...prev];
                        updated[updated.length - 1] = {
                          ...lastMessage,
                          content: data.data.content || lastMessage.content,
                          quickResponses: data.data.quickResponses ?? lastMessage.quickResponses
                        };
                        return updated;
                      }
                      return [...prev, data.data];
                    });
                    setTypingAgent(data.data.agent);
                  } else if (data.type === 'stream') {
                    // Handle streaming chunks
                    setMessages(prev => {
                      const lastMessage = prev[prev.length - 1];
                      // If the last message is from the same agent, append to it
                      if (lastMessage && lastMessage.agent === data.agent) {
                        const updatedMessages = [...prev];
                        updatedMessages[updatedMessages.length - 1] = {
                          ...lastMessage,
                          content: lastMessage.content + data.content
                        };
                        return updatedMessages;
                      } else {
                        // Create new message for this agent
                        return [...prev, {
                          agent: data.agent,
                          role: 'assistant',
                          content: data.content,
                          timestamp: new Date().toISOString()
                        }];
                      }
                    });
                    setTypingAgent(data.agent);
                  } else if (data.type === 'end') {
                    setConversationState(data.state || conversationState);
                    setIsTyping(false);
                    setTypingAgent('');
                  } else if (data.type === 'error') {
                    console.error('Stream error:', data.message);
                    setMessages(prev => [...prev, {
                      agent: '시스템',
                      role: 'system',
                      content: `오류: ${data.message}`,
                      timestamp: new Date().toISOString()
                    }]);
                  }
                }
              } catch (e) {
                console.error('JSON parse error:', e, 'Line:', line);
              }
            }
          }
        }
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
  };

  const handleQuickResponse = async (response: string, messageIndex: number) => {
    // 해당 메시지의 모든 버튼을 클릭된 것으로 표시 (모든 버튼이 사라지도록)
    setClickedButtons(prev => {
      const newMap = new Map(prev);
      // 해당 메시지의 모든 버튼을 클릭된 것으로 처리
      newMap.set(messageIndex, new Set(['all_buttons_clicked']));
      return newMap;
    });
    
    // "시작하자" 버튼을 눌렀을 때 즉시 상태 변경
    if (response === '시작하자') {
      setConversationState('ongoing_debate');
    }
    
    // 먼저 사용자 메시지를 추가
    const userMessage: Message = {
      agent: '사용자',
      role: 'user',
      content: response,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    
    // 입력 필드 비우기
  // 비제어 입력이라 상태 초기화 불필요
    
    // 로딩 상태 설정
    setIsLoading(true);
    setIsTyping(true);

    try {
      const messageType = response === '시작하자' ? 'start' : 
                         response === '이제 결론을 내줘' ? 'conclusion' : 'quick_response';
      
      const response_data = await fetch(`${API_URL}/api/chat/message/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: response,
          messageType
        }),
      });

      if (!response_data.ok) {
        throw new Error(`HTTP error! status: ${response_data.status}`);
      }

      const reader = response_data.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() && line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6).trim();
                if (jsonStr) {
                  const data = JSON.parse(jsonStr);
                  
                  if (data.type === 'message') {
                    // 최종 메시지를 스트림 누적 메시지와 병합(중복 방지)
                    setMessages(prev => {
                      const lastMessage = prev[prev.length - 1];
                      if (lastMessage && lastMessage.agent === data.data.agent && lastMessage.role === 'assistant') {
                        const updated = [...prev];
                        updated[updated.length - 1] = {
                          ...lastMessage,
                          content: data.data.content || lastMessage.content,
                          quickResponses: data.data.quickResponses ?? lastMessage.quickResponses
                        };
                        return updated;
                      }
                      return [...prev, data.data];
                    });
                    setTypingAgent(data.data.agent);
                  } else if (data.type === 'stream') {
                    // Handle streaming chunks
                    setMessages(prev => {
                      const lastMessage = prev[prev.length - 1];
                      // If the last message is from the same agent, append to it
                      if (lastMessage && lastMessage.agent === data.agent) {
                        const updatedMessages = [...prev];
                        updatedMessages[updatedMessages.length - 1] = {
                          ...lastMessage,
                          content: lastMessage.content + data.content
                        };
                        return updatedMessages;
                      } else {
                        // Create new message for this agent
                        return [...prev, {
                          agent: data.agent,
                          role: 'assistant',
                          content: data.content,
                          timestamp: new Date().toISOString()
                        }];
                      }
                    });
                    setTypingAgent(data.agent);
                  } else if (data.type === 'end') {
                    setConversationState(data.state || conversationState);
                    setIsTyping(false);
                    setTypingAgent('');
                  } else if (data.type === 'error') {
                    console.error('Stream error:', data.message);
                    setMessages(prev => [...prev, {
                      agent: '시스템',
                      role: 'system',
                      content: `오류: ${data.message}`,
                      timestamp: new Date().toISOString()
                    }]);
                  }
                }
              } catch (e) {
                console.error('JSON parse error:', e, 'Line:', line);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to send quick response:', error);
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
  };



  if (!isOpen) return null;

  const Wrapper: React.FC<{children: React.ReactNode}> = ({ children }) => {
    if (fullScreen) {
      return (
        <div 
          className="fixed inset-0 z-50"
          style={{
            backgroundImage: 'url(/images/bg.jpeg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{
              transform: 'scaleX(1) scaleY(1)',
              transformOrigin: 'center'
            }}
          >
            <div className="bg-white rounded-3xl shadow-2xl w-[95vw] h-[95vh] flex flex-col overflow-hidden">
          {children}
            </div>
          </div>
        </div>
      );
    }
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          backgroundImage: 'url(/images/bg.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div 
          className="flex items-center justify-center"
          style={{
            transform: 'scaleX(1) scaleY(1)',
            transformOrigin: 'center'
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-[95vw] h-[95vh] flex flex-col overflow-hidden">
          {children}
          </div>
        </div>
      </div>
    );
  };


  return (
    <Wrapper>
      {/* Header */}
      <div 
        className={`text-white p-3 ${fullScreen ? '' : 'rounded-t-lg'} flex items-center justify-between shadow-lg`}
        style={{
          background: 'linear-gradient(135deg, #A50034, #8B0028, #6B0018)'
        }}
      >
        <div className="flex items-center space-x-3">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-75"></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-150"></div>
          </div>
          <h2 className="text-xl font-bold">LG 가전구독 할래 말래?</h2>
        </div>
        <div className="flex items-center space-x-2">
          {detailedProduct && (
            <button
              onClick={() => setShowProductInfo(!showProductInfo)}
              className="p-2 hover:bg-red-950 rounded-full transition-colors"
              title={showProductInfo ? '제품 정보 숨기기' : '제품 정보 보기'}
            >
              {showProductInfo ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          )}
          <button
            onClick={restartChat}
            className="p-2 hover:bg-red-950 rounded-full transition-colors"
            title="채팅 새로 시작"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left Side: Product Info Sidebar */}
        {showProductInfo && detailedProduct && (
          <ProductSidebar detailedProduct={detailedProduct} />
        )}

        {/* Right Side: Chat Area */}
        <ChatArea
          messages={messages}
          isTyping={isTyping}
          typingAgent={typingAgent}
          clickedButtons={clickedButtons}
          isLoading={isLoading}
          isInitializing={isInitializing}
          conversationState={conversationState}
          detailedProduct={detailedProduct}
          onQuickResponse={handleQuickResponse}
          onSend={(text: string) => sendMessage(text, 'text')}
          fullScreen={fullScreen}
          messagesContainerRef={messagesContainerRef}
        />
      </div>
    </Wrapper>
  );
};

export default ChatbotWindow;
