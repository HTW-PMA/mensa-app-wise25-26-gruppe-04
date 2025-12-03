/**
 * useAIChat Hook
 * Custom hook for AI chat functionality
 */

import { useState } from 'react';
import { AIService } from '@/services/ai/aiService';

export function useAIChat() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = async (message: string, context?: string): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await AIService.chat(message, context);
      return response;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading,
    error,
  };
}
