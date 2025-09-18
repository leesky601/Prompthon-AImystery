'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, MessageCircle, ShoppingCart, Package, User } from 'lucide-react';

interface Message {
  agent: string;
  role: string;
  content: string;
  timestamp: string;
  quickResponses?: string[];
}

interface ChatbotWindowProps {
  productId?: string;
  isOpen: boolean;
  onClose: () => void;
  fullScreen?: boolean;
}

const ChatbotWindow: React.FC<ChatbotWindowProps> = ({ productId, isOpen, onClose, fullScreen = false }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationState, setConversationState] = useState('welcome');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  // Initialize chat session when window opens
  useEffect(() => {
    if (isOpen && !sessionId) {
      initializeChat();
    }
  }, [isOpen]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    }
  };

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

  const sendMessage = async (message: string = inputValue, messageType: string = 'text') => {
    if (!sessionId || (!message && messageType === 'text')) return;

    // Clear input if it's a text message
    if (messageType === 'text') {
      setInputValue('');
    }

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
  };

  const handleQuickResponse = (response: string) => {
    if (response === '시작하자') {
      sendMessage(response, 'start');
    } else {
      sendMessage(response, 'quick_response');
    }
  };

  const getAgentIcon = (agent: string) => {
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
  };

  const getAgentColor = (agent: string) => {
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
  };

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
        <button
          onClick={onClose}
          className="p-2 hover:bg-red-800 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Messages Container */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 ${fullScreen ? '' : ''}`}>
        {messages.map((message, index) => (
          <div
            key={index}
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

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`border-t bg-white p-4 ${fullScreen ? '' : 'rounded-b-lg'}`}>
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && conversationState !== 'welcome' && sendMessage()}
            placeholder={conversationState === 'conclusion' ? '대화가 종료되었습니다' : (conversationState === 'welcome' ? '아래 "시작하자" 버튼을 눌러주세요' : '메시지를 입력하세요...')}
            disabled={isLoading || conversationState === 'conclusion' || conversationState === 'welcome'}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !inputValue || conversationState === 'conclusion' || conversationState === 'welcome'}
            className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">전송</span>
          </button>
        </div>
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
