'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from 'ai/react';
import { useProjectStore } from '@/store/projectStore';
import { useWebContainer } from '@/hooks/useWebContainer';
import { Send, Loader } from 'lucide-react';

export function ChatPanel() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const projectStore = useProjectStore();
  const webContainer = useWebContainer();
  const [status, setStatus] = useState<string>('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Process AI tool calls
  useEffect(() => {
    const processMessages = async () => {
      for (const msg of messages) {
        if (msg.role === 'assistant' && msg.content) {
          // Parse tool calls from assistant response
          const toolCallRegex = /tool_call:\s*([\s\S]*?)(?=tool_call:|$)/g;
          let match;
          while ((match = toolCallRegex.exec(msg.content)) !== null) {
            try {
              const toolCall = JSON.parse(match[1]);
              if (toolCall.type === 'createFile') {
                setStatus(`Creating file: ${toolCall.path}`);
                projectStore.createFile(toolCall.path, toolCall.content);
                if (webContainer.isReady && webContainer.instance) {
                  await webContainer.writeFile(toolCall.path, toolCall.content);
                }
              } else if (toolCall.type === 'updateFile') {
                setStatus(`Updating file: ${toolCall.path}`);
                projectStore.updateFile(toolCall.path, toolCall.content);
                if (webContainer.isReady && webContainer.instance) {
                  await webContainer.writeFile(toolCall.path, toolCall.content);
                }
              } else if (toolCall.type === 'runCommand') {
                setStatus(`Running: ${toolCall.command}`);
                if (webContainer.isReady && webContainer.instance) {
                  await webContainer.runCommand(toolCall.command, (output) => {
                    setStatus(`Output: ${output}`);
                  });
                }
              }
            } catch (e) {
              console.error('Failed to parse tool call:', e);
            }
          }
        }
      }
      setStatus('');
    };

    processMessages();
  }, [messages, projectStore, webContainer]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">AI Code Generator</h2>
              <p className="text-sm">Describe what you want to build...</p>
            </div>
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-700 text-slate-100 rounded-bl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
            </div>
          </div>
        ))}
        {status && (
          <div className="flex justify-start">
            <div className="max-w-xs p-3 rounded-lg bg-slate-600 text-slate-200 rounded-bl-none flex items-center gap-2">
              <Loader className="h-4 w-4 animate-spin" />
              <p className="text-sm">{status}</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-700 bg-slate-750">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your request here..."
            className="flex-1 px-3 py-2 rounded-lg bg-slate-700 text-white placeholder-slate-400 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
