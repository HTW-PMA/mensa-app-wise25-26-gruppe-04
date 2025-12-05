/**
 * useAIChat Hook
 * Custom hook for AI chat functionality
 */

import { useState } from 'react';
import { aiService } from '@/services/ai/aiService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function useAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = async (userMessage: string): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Add user message to history
      const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
      setMessages(newMessages);
      
      // Call AI service with full history
      const response = await aiService.chat(newMessages);
      
      // Add AI response to history
      setMessages([...newMessages, { role: 'assistant', content: response }]);
      
      return response;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    sendMessage,
    clearMessages,
    isLoading,
    error,
  };
}
