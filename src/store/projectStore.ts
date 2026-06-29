import { create } from 'zustand';

export interface FileNode {
  path: string;
  content: string;
  isDirectory?: boolean;
  children?: FileNode[];
}

export interface ProjectState {
  files: Map<string, string>;
  currentFile: string | null;
  isRunning: boolean;
  previewUrl: string | null;
  terminalOutput: string;
  
  // Actions
  createFile: (path: string, content: string) => void;
  updateFile: (path: string, content: string) => void;
  deleteFile: (path: string) => void;
  setCurrentFile: (path: string | null) => void;
  setIsRunning: (isRunning: boolean) => void;
  setPreviewUrl: (url: string | null) => void;
  addTerminalOutput: (output: string) => void;
  clearTerminalOutput: () => void;
  getFileTree: () => FileNode[];
}

const buildFileTree = (files: Map<string, string>): FileNode[] => {
  const tree: { [key: string]: FileNode } = {};

  Array.from(files.keys()).forEach((filePath) => {
    const parts = filePath.split('/');
    let current = tree;

    parts.forEach((part, index) => {
      if (!current[part]) {
        const isDir = index < parts.length - 1;
        current[part] = {
          path: parts.slice(0, index + 1).join('/'),
          content: '',
          isDirectory: isDir,
          children: [],
        };
      }

      if (index === parts.length - 1) {
        current[part].content = files.get(filePath) || '';
      } else {
        if (!current[part].children) {
          current[part].children = [];
        }
        current = current[part].children!.reduce(
          (acc, child) => {
            acc[child.path.split('/').pop() || ''] = child;
            return acc;
          },
          {} as { [key: string]: FileNode }
        );
      }
    });
  });

  return Object.values(tree);
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  files: new Map(),
  currentFile: null,
  isRunning: false,
  previewUrl: null,
  terminalOutput: '',

  createFile: (path: string, content: string) =>
    set((state) => {
      const newFiles = new Map(state.files);
      newFiles.set(path, content);
      return { files: newFiles };
    }),

  updateFile: (path: string, content: string) =>
    set((state) => {
      const newFiles = new Map(state.files);
      newFiles.set(path, content);
      return { files: newFiles };
    }),

  deleteFile: (path: string) =>
    set((state) => {
      const newFiles = new Map(state.files);
      newFiles.delete(path);
      return { files: newFiles };
    }),

  setCurrentFile: (path: string | null) =>
    set({ currentFile: path }),

  setIsRunning: (isRunning: boolean) =>
    set({ isRunning }),

  setPreviewUrl: (url: string | null) =>
    set({ previewUrl: url }),

  addTerminalOutput: (output: string) =>
    set((state) => ({
      terminalOutput: state.terminalOutput + output,
    })),

  clearTerminalOutput: () =>
    set({ terminalOutput: '' }),

  getFileTree: () => {
    const state = get();
    return buildFileTree(state.files);
  },
}));
