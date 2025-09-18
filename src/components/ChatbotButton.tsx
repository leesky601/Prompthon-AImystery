'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';

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
  const openChatWindow = () => {
    const url = productId ? `/chat?productId=${encodeURIComponent(productId)}` : '/chat';
    // Try to open as a new popup window (not just a new tab)
    const features = [
      'popup=yes',
      'noopener',
      'resizable=yes',
      'scrollbars=yes',
      'width=' + Math.max(980, Math.floor(window.screen.width * 0.9)),
      'height=' + Math.max(720, Math.floor(window.screen.height * 0.9)),
      'left=' + Math.floor((window.screen.width - Math.max(980, Math.floor(window.screen.width * 0.9))) / 2),
      'top=' + Math.floor((window.screen.height - Math.max(720, Math.floor(window.screen.height * 0.9))) / 2)
    ].join(',');
    
    // Check if window is already open
    const existingWindow = window.open('', 'lg-chatbot-window');
    if (existingWindow && !existingWindow.closed && existingWindow.location.href !== 'about:blank') {
      // Window already exists, just focus it and update URL if needed
      existingWindow.location.href = url;
      existingWindow.focus();
    } else {
      // Open new window
      const win = window.open(url, 'lg-chatbot-window', features);
      if (win) {
        win.focus();
      }
      // Don't show any alert for popup blocking - just fail silently
    }
  };

  return (
    <button
      onClick={openChatWindow}
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
  );
};

export default ChatbotButton;