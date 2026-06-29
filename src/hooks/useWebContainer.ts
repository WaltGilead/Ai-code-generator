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
  const bootAttempts = useRef(0);
  const maxBootAttempts = 3;

  useEffect(() => {
    const bootWebContainer = async () => {
      try {
        bootAttempts.current++;
        const instance = await WebContainer.boot();
        instanceRef.current = instance;
        setState({ instance, isReady: true, error: null });
        console.log('WebContainer booted successfully');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('WebContainer boot error:', errorMessage);

        if (bootAttempts.current < maxBootAttempts) {
          console.log(`Retrying boot (attempt ${bootAttempts.current}/${maxBootAttempts})`);
          setTimeout(bootWebContainer, 2000);
        } else {
          setState({
            instance: null,
            isReady: false,
            error: `Failed to initialize WebContainer after ${maxBootAttempts} attempts: ${errorMessage}`,
          });
        }
      }
    };

    bootWebContainer();
  }, []);

  const writeFile = async (path: string, content: string) => {
    if (!instanceRef.current) {
      throw new Error('WebContainer not initialized');
    }

    try {
      // Ensure directory exists
      const dirs = path.split('/').slice(0, -1);
      if (dirs.length > 0) {
        const dirPath = dirs.join('/');
        try {
          await instanceRef.current.fs.mkdir(dirPath, { recursive: true });
        } catch (e) {
          // Directory might already exist
        }
      }

      await instanceRef.current.fs.writeFile(path, content);
      projectStore.updateFile(path, content);
      console.log(`File written: ${path}`);
    } catch (error) {
      console.error(`Failed to write file ${path}:`, error);
      throw error;
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
      console.error(`Failed to read file ${path}:`, error);
      throw error;
    }
  };

  const runCommand = async (command: string, onOutput?: (output: string) => void) => {
    if (!instanceRef.current) {
      throw new Error('WebContainer not initialized');
    }

    try {
      console.log(`Running command: ${command}`);
      projectStore.addTerminalOutput(`$ ${command}\n`);

      const process = await instanceRef.current.spawn('sh', ['-c', command]);

      process.output.pipeTo(
        new WritableStream({
          write: (chunk: string) => {
            onOutput?.(chunk);
            projectStore.addTerminalOutput(chunk);
          },
        })
      );

      const exitCode = await process.exit;
      console.log(`Command completed with exit code: ${exitCode}`);
      return exitCode;
    } catch (error) {
      console.error(`Failed to run command: ${command}`, error);
      projectStore.addTerminalOutput(`Error: ${error}\n`);
      throw error;
    }
  };

  const getServerUrl = (port: number = 3000): string | null => {
    if (!instanceRef.current) {
      return null;
    }
    try {
      const url = instanceRef.current.getNetworkUrl(port);
      console.log(`Server URL: ${url}`);
      return url;
    } catch (error) {
      console.error('Failed to get server URL:', error);
      return null;
    }
  };

  return {
    ...state,
    writeFile,
    readFile,
    runCommand,
    getServerUrl,
  };
}
