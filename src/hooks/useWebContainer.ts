'use client';

import { useEffect, useCallback, useState } from 'react';
import { WebContainer, FileSystemTree } from '@webcontainer/api';
import { useProjectStore } from '@/store/projectStore';
import { WebContainerError } from '@/utils/errorHandling';

export interface UseWebContainerReturn {
  instance: WebContainer | null;
  isReady: boolean;
  error: string | null;
  writeFile: (path: string, content: string) => Promise<void>;
  readFile: (path: string) => Promise<string>;
  runCommand: (command: string, onOutput?: (output: string) => void) => Promise<number>;
  getServerUrl: (port?: number) => string | null;
}

export function useWebContainer(): UseWebContainerReturn {
  const [state, setState] = useState({
    instance: null as WebContainer | null,
    isReady: false,
    error: null as string | null,
  });

  const projectStore = useProjectStore();

  // Boot WebContainer on mount
  useEffect(() => {
    const bootContainer = async () => {
      try {
        const instance = await WebContainer.boot();
        setState({ instance, isReady: true, error: null });
        projectStore.setIsRunning(true);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to boot WebContainer';
        setState({ instance: null, isReady: false, error: message });
      }
    };

    bootContainer();
  }, [projectStore]);

  const writeFile = useCallback(
    async (path: string, content: string) => {
      if (!state.instance) {
        throw new WebContainerError('WebContainer not initialized', 'WEBCONTAINER_NOT_READY');
      }

      try {
        await state.instance.fs.writeFile(path, content);
        projectStore.updateFile(path, content);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to write file';
        throw new WebContainerError(message, 'FILE_WRITE_FAILED');
      }
    },
    [state.instance, projectStore]
  );

  const readFile = useCallback(
    async (path: string): Promise<string> => {
      if (!state.instance) {
        throw new WebContainerError('WebContainer not initialized', 'WEBCONTAINER_NOT_READY');
      }

      try {
        const content = await state.instance.fs.readFile(path, 'utf-8');
        return content;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to read file';
        throw new WebContainerError(message, 'FILE_READ_FAILED');
      }
    },
    [state.instance]
  );

  const runCommand = useCallback(
    async (command: string, onOutput?: (output: string) => void): Promise<number> => {
      if (!state.instance) {
        throw new WebContainerError('WebContainer not initialized', 'WEBCONTAINER_NOT_READY');
      }

      try {
        const process = await state.instance.spawn('sh', ['-c', command]);

        // Pipe output
        process.output.pipeTo(
          new WritableStream({
            write: (chunk: string) => {
              if (onOutput) onOutput(chunk);
              projectStore.addTerminalOutput(chunk);
            },
          })
        );

        const exitCode = await process.exit;
        return exitCode;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Command execution failed';
        throw new WebContainerError(message, 'COMMAND_EXECUTION_FAILED');
      }
    },
    [state.instance, projectStore]
  );

  const getServerUrl = useCallback(
    (port: number = 3000): string | null => {
      if (!state.instance) return null;
      try {
        return state.instance.getNetworkUrl(port);
      } catch (error) {
        return null;
      }
    },
    [state.instance]
  );

  return {
    instance: state.instance,
    isReady: state.isReady,
    error: state.error,
    writeFile,
    readFile,
    runCommand,
    getServerUrl,
  };
}
