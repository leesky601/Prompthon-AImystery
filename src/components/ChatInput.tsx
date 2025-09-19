'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  isLoading: boolean;
  disabled: boolean;
  placeholder: string;
  autoFocus?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  isLoading,
  disabled,
  placeholder,
  autoFocus = false
}) => {
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 포커스 관리
  useEffect(() => {
    if (autoFocus && !disabled && !isLoading && inputRef.current) {
      const timer = setTimeout(() => {
        if (inputRef.current && document.activeElement !== inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus, disabled, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading && !isComposing && !disabled && value.trim()) {
      e.preventDefault();
      onSend(value);
    }
  };

  const handleSend = () => {
    if (!isLoading && !disabled && value.trim()) {
      onSend(value);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-full text-sm outline-none focus:border-red-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
        autoComplete="off"
        autoFocus={autoFocus}
      />
      <button
        onClick={handleSend}
        disabled={isLoading || !value.trim() || disabled}
        className="px-6 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-0.5 whitespace-nowrap overflow-hidden text-ellipsis min-w-[60px]"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
        <span className="hidden sm:inline ml-2">전송</span>
      </button>
    </div>
  );
};

export default ChatInput;
