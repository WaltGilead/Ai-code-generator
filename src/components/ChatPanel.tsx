'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from 'ai/react';
import { useProjectStore } from '@/store/projectStore';
import { useWebContainer } from '@/hooks/useWebContainer';
import { Send, Loader, AlertCircle } from 'lucide-react';

interface ChatPanelProps {
  onError?: (message: string) => void;
}

export function ChatPanel({ onError }: ChatPanelProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    onError: (err) => {
      onError?.(err.message);
    },
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const projectStore = useProjectStore();
  const webContainer = useWebContainer();
  const [status, setStatus] = useState<string>('');
  const [processingTools, setProcessingTools] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Process AI tool calls from messages
  useEffect(() => {
    const processToolCalls = async () => {
      if (processingTools) return;

      setProcessingTools(true);

      for (const msg of messages) {
        if (msg.role === 'assistant' && msg.content) {
          // Parse JSON tool calls from code blocks
          const jsonBlocks = msg.content.match(/```json\n([\s\S]*?)\n```/g) || [];

          for (const block of jsonBlocks) {
            try {
              const jsonStr = block.replace(/```json\n|\n```/g, '');
              const toolCall = JSON.parse(jsonStr);

              if (toolCall.type === 'createFile') {
                const { path, content } = toolCall;
                setStatus(`Creating file: ${path}`);
                projectStore.createFile(path, content);

                if (webContainer.isReady && webContainer.instance) {
                  try {
                    await webContainer.writeFile(path, content);
                  } catch (err) {
                    console.error(`Failed to write file ${path}:`, err);
                    onError?.(`Failed to create file: ${path}`);
                  }
                }
              } else if (toolCall.type === 'updateFile') {
                const { path, content } = toolCall;
                setStatus(`Updating file: ${path}`);
                projectStore.updateFile(path, content);

                if (webContainer.isReady && webContainer.instance) {
                  try {
                    await webContainer.writeFile(path, content);
                  } catch (err) {
                    console.error(`Failed to update file ${path}:`, err);
                    onError?.(`Failed to update file: ${path}`);
                  }
                }
              } else if (toolCall.type === 'runCommand') {
                const { command } = toolCall;
                setStatus(`Running: ${command}`);

                if (webContainer.isReady && webContainer.instance) {
                  try {
                    await webContainer.runCommand(command);

                    // Check if dev server was started
                    if (
                      command.includes('npm run dev') ||
                      command.includes('vite') ||
                      command.includes('next dev')
                    ) {
                      // Wait a bit for server to start
                      setTimeout(() => {
                        const serverUrl = webContainer.getServerUrl(3000);
                        if (serverUrl) {
                          projectStore.setPreviewUrl(serverUrl);
                          setStatus(`Preview running at: ${serverUrl}`);
                        }
                      }, 2000);
                    }
                  } catch (err) {
                    console.error(`Failed to run command ${command}:`, err);
                    onError?.(`Command failed: ${command}`);
                  }
                }
              }
            } catch (e) {
              console.error('Failed to parse tool call:', e);
            }
          }
        }
      }

      setProcessingTools(false);
      setStatus('');
    };

    processToolCalls();
  }, [messages, projectStore, webContainer, onError]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">🤖 AI Code Generator</h2>
              <p className="text-sm">Describe what you want to build...</p>
              <p className="text-xs mt-4 text-slate-500">
                Examples: "React counter", "Todo app", "Weather app"
              </p>
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
              <p className="text-sm whitespace-pre-wrap break-words line-clamp-5">
                {msg.content}
              </p>
            </div>
          </div>
        ))}

        {status && (
          <div className="flex justify-start">
            <div className="max-w-xs p-3 rounded-lg bg-slate-600 text-slate-200 rounded-bl-none flex items-center gap-2">
              <Loader className="h-4 w-4 animate-spin flex-shrink-0" />
              <p className="text-sm truncate">{status}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-start">
            <div className="max-w-xs p-3 rounded-lg bg-red-600 text-white rounded-bl-none flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm">{error.message || 'An error occurred'}</p>
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
            disabled={isLoading || processingTools || !webContainer.isReady}
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || processingTools || !webContainer.isReady}
            title={!webContainer.isReady ? 'WebContainer initializing...' : ''}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading || processingTools ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
        {!webContainer.isReady && webContainer.error && (
          <p className="text-xs text-red-400 mt-2">{webContainer.error}</p>
        )}
        {!webContainer.isReady && !webContainer.error && (
          <p className="text-xs text-slate-400 mt-2">Initializing WebContainer...</p>
        )}
      </div>
    </div>
  );
}
