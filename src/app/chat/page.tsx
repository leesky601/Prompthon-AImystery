'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatbotWindow from '@/components/ChatbotWindow';

export default function ChatPage() {
  const searchParams = useSearchParams();
  const productId = useMemo(() => searchParams.get('productId') || undefined, [searchParams]);

  return (
    <div className="h-screen w-screen bg-white">
      <ChatbotWindow
        productId={productId}
        isOpen={true}
        onClose={() => {
          if (typeof window !== 'undefined') window.close();
        }}
        fullScreen
      />
    </div>
  );
}

