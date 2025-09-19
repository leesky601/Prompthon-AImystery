'use client';

import React, { useState, useRef, useCallback, memo } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  conversationState: string;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = memo(({ 
  onSendMessage, 
  isLoading, 
  conversationState,
  disabled = false 
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(() => {
    if (inputValue.trim() && !isLoading && !disabled) {
      onSendMessage(inputValue);
      setInputValue('');
      // Keep focus after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [inputValue, isLoading, disabled, onSendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const getPlaceholder = () => {
    if (conversationState === 'conclusion') return '대화가 종료되었습니다';
    if (conversationState === 'welcome') return '아래 "시작하자" 버튼을 눌러주세요';
    return '메시지를 입력하세요...';
  };

  const isDisabled = disabled || isLoading || conversationState === 'conclusion' || conversationState === 'welcome';

  return (
    <div className="flex space-x-2">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={getPlaceholder()}
        disabled={isDisabled}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        autoComplete="off"
      />
      <button
        onClick={handleSend}
        disabled={isDisabled || !inputValue.trim()}
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
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;