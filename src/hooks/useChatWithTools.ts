'use client';

import { useCallback, useEffect } from 'react';
import { useChat } from 'ai/react';
import { useProjectStore } from '@/store/projectStore';
import { useWebContainer } from './useWebContainer';
import { parseToolCalls } from '@/utils/fileUtils';

export function useChatWithTools() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
  });

  const projectStore = useProjectStore();
  const webContainer = useWebContainer();

  // Process tool calls from AI responses
  useEffect(() => {
    const processMessages = async () => {
      for (const msg of messages) {
        if (msg.role === 'assistant' && msg.content) {
          // Try to parse tool calls
          const toolCalls = parseToolCalls(msg.content);

          for (const toolCall of toolCalls) {
            try {
              if (toolCall.type === 'createFile' && toolCall.path && toolCall.content) {
                projectStore.createFile(toolCall.path, toolCall.content);
                if (webContainer.isReady && webContainer.instance) {
                  await webContainer.writeFile(toolCall.path, toolCall.content);
                }
              } else if (toolCall.type === 'updateFile' && toolCall.path && toolCall.content) {
                projectStore.updateFile(toolCall.path, toolCall.content);
                if (webContainer.isReady && webContainer.instance) {
                  await webContainer.writeFile(toolCall.path, toolCall.content);
                }
              } else if (toolCall.type === 'runCommand' && toolCall.command) {
                if (webContainer.isReady && webContainer.instance) {
                  await webContainer.runCommand(toolCall.command);
                  // Check if dev server started
                  if (toolCall.command.includes('dev')) {
                    setTimeout(() => {
                      const serverUrl = webContainer.getServerUrl(3000);
                      if (serverUrl) {
                        projectStore.setPreviewUrl(serverUrl);
                      }
                    }, 2000);
                  }
                }
              }
            } catch (error) {
              console.error('Failed to execute tool call:', error);
            }
          }
        }
      }
    };

    processMessages();
  }, [messages, projectStore, webContainer]);

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
  };
}
