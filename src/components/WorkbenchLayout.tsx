'use client';

import { useState } from 'react';
import { ChatPanel } from './ChatPanel';
import { EditorPanel } from './EditorPanel';
import { PreviewPanel } from './PreviewPanel';
import { TerminalPanel } from './TerminalPanel';

type TabType = 'editor' | 'preview' | 'terminal';

export function WorkbenchLayout() {
  const [activeTab, setActiveTab] = useState<TabType>('editor');

  return (
    <div className="flex h-screen gap-4 p-4 bg-slate-900">
      {/* Left Panel: Chat */}
      <div className="w-1/3 flex flex-col bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
        <ChatPanel />
      </div>

      {/* Right Panel: Workbench */}
      <div className="w-2/3 flex flex-col bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex gap-2 p-4 border-b border-slate-700 bg-slate-700/50">
          <TabButton
            label="Editor"
            isActive={activeTab === 'editor'}
            onClick={() => setActiveTab('editor')}
          />
          <TabButton
            label="Preview"
            isActive={activeTab === 'preview'}
            onClick={() => setActiveTab('preview')}
          />
          <TabButton
            label="Terminal"
            isActive={activeTab === 'terminal'}
            onClick={() => setActiveTab('terminal')}
          />
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'editor' && <EditorPanel />}
          {activeTab === 'preview' && <PreviewPanel />}
          {activeTab === 'terminal' && <TerminalPanel />}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
      }`}
    >
      {label}
    </button>
  );
}
