'use client';

import { useState, useCallback } from 'react';
import { useChat } from 'ai/react';

export function useChatHook() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    onResponse: (response) => {
      if (!response.ok) {
        console.error('Chat response error:', response);
      }
    },
  });

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
  };
}
