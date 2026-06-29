'use client';

import { useEffect, useRef, useState } from 'react';
import { WebContainer } from '@webcontainer/api';
import { useProjectStore } from '@/store/projectStore';

export interface WebContainerInstance {
  instance: WebContainer | null;
  isReady: boolean;
  error: string | null;
}

export function useWebContainer() {
  const [state, setState] = useState<WebContainerInstance>({
    instance: null,
    isReady: false,
    error: null,
  });

  const projectStore = useProjectStore();
  const instanceRef = useRef<WebContainer | null>(null);

  useEffect(() => {
    const bootWebContainer = async () => {
      try {
        const instance = await WebContainer.boot();
        instanceRef.current = instance;
        setState({ instance, isReady: true, error: null });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState({
          instance: null,
          isReady: false,
          error: errorMessage,
        });
      }
    };

    bootWebContainer();
  }, []);

  const writeFile = async (path: string, content: string) => {
    if (!instanceRef.current) {
      throw new Error('WebContainer not initialized');
    }

    try {
      await instanceRef.current.fs.writeFile(path, content);
      projectStore.updateFile(path, content);
    } catch (error) {
      throw new Error(`Failed to write file: ${error}`);
    }
  };

  const readFile = async (path: string): Promise<string> => {
    if (!instanceRef.current) {
      throw new Error('WebContainer not initialized');
    }

    try {
      const content = await instanceRef.current.fs.readFile(path, 'utf-8');
      return content;
    } catch (error) {
      throw new Error(`Failed to read file: ${error}`);
    }
  };

  const runCommand = async (command: string, onOutput?: (output: string) => void) => {
    if (!instanceRef.current) {
      throw new Error('WebContainer not initialized');
    }

    try {
      const process = await instanceRef.current.spawn('sh', ['-c', command]);

      process.output.pipeTo(
        new WritableStream({
          write: (chunk: string) => {
            onOutput?.(chunk);
            projectStore.addTerminalOutput(chunk);
          },
        })
      );

      return await process.exit;
    } catch (error) {
      throw new Error(`Failed to run command: ${error}`);
    }
  };

  const getServerUrl = (port: number = 3000): string => {
    if (!instanceRef.current) {
      return '';
    }
    return instanceRef.current.getNetworkUrl(port);
  };

  return {
    ...state,
    writeFile,
    readFile,
    runCommand,
    getServerUrl,
  };
}
