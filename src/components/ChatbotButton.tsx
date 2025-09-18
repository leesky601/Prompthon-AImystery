'use client';

import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import ChatbotWindow from './ChatbotWindow';

interface ChatbotButtonProps {
  productId?: string;
  className?: string;
  buttonText?: string;
}

const ChatbotButton: React.FC<ChatbotButtonProps> = ({ 
  productId, 
  className = '',
  buttonText = '할래말래?' 
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsChatOpen(true)}
        className={`
          inline-flex items-center justify-center
          px-6 py-3
          bg-gradient-to-r from-red-600 to-red-700
          hover:from-red-700 hover:to-red-800
          text-white font-bold text-lg
          rounded-full
          shadow-lg hover:shadow-xl
          transform transition-all duration-200
          hover:scale-105 active:scale-95
          ${className}
        `}
      >
        <MessageSquare className="w-5 h-5 mr-2" />
        {buttonText}
      </button>

      <ChatbotWindow 
        productId={productId}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
};

export default ChatbotButton;