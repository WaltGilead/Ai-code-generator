'use client';

import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { useProjectStore } from '@/store/projectStore';
import 'xterm/css/xterm.css';

export function TerminalPanel() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstanceRef = useRef<Terminal | null>(null);
  const { terminalOutput } = useProjectStore();

  useEffect(() => {
    if (!terminalRef.current) return;

    const terminal = new Terminal({
      theme: {
        background: '#1e293b',
        foreground: '#e2e8f0',
        cursor: '#e2e8f0',
      },
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, Courier New, monospace',
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(terminalRef.current);
    fitAddon.fit();

    terminalInstanceRef.current = terminal;

    const handleResize = () => {
      try {
        fitAddon.fit();
      } catch (e) {
        console.error('Terminal resize error:', e);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      terminal.dispose();
    };
  }, []);

  useEffect(() => {
    if (terminalInstanceRef.current && terminalOutput) {
      terminalInstanceRef.current.write(terminalOutput);
    }
  }, [terminalOutput]);

  return <div ref={terminalRef} className="w-full h-full" />;
}
