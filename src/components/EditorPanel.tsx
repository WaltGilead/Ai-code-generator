'use client';

import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useProjectStore } from '@/store/projectStore';
import { ChevronRight, File, Folder } from 'lucide-react';

export function EditorPanel() {
  const { files, currentFile, setCurrentFile, updateFile } = useProjectStore();
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [fileTree, setFileTree] = useState<any[]>([]);

  // Build file tree structure
  useEffect(() => {
    const tree: { [key: string]: any } = {};

    Array.from(files.keys()).forEach((filePath) => {
      const parts = filePath.split('/');
      let current = tree;

      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = {
            name: part,
            path: parts.slice(0, index + 1).join('/'),
            isFile: index === parts.length - 1,
            children: {},
          };
        }
        current = current[part].children;
      });
    });

    setFileTree(Object.values(tree));
  }, [files]);

  const toggleDir = (path: string) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedDirs(newExpanded);
  };

  const FileTreeNode = ({ node }: { node: any }) => (
    <div>
      <div
        onClick={() => {
          if (node.isFile) {
            setCurrentFile(node.path);
          } else {
            toggleDir(node.path);
          }
        }}
        className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-slate-600 rounded ${
          currentFile === node.path ? 'bg-blue-600' : ''
        }`}
      >
        {!node.isFile && (
          <ChevronRight
            className={`h-4 w-4 transition-transform ${
              expandedDirs.has(node.path) ? 'rotate-90' : ''
            }`}
          />
        )}
        {node.isFile ? (
          <File className="h-4 w-4 text-slate-400" />
        ) : (
          <Folder className="h-4 w-4 text-slate-400" />
        )}
        <span className="text-sm font-medium">{node.name}</span>
      </div>
      {!node.isFile && expandedDirs.has(node.path) && Object.keys(node.children).length > 0 && (
        <div className="ml-4">
          {Object.values(node.children).map((child: any) => (
            <FileTreeNode key={child.path} node={child} />
          ))}
        </div>
      )}
    </div>
  );

  const currentFileContent = currentFile ? files.get(currentFile) || '' : '';

  return (
    <div className="flex h-full">
      {/* File Tree Sidebar */}
      <div className="w-1/4 border-r border-slate-700 overflow-y-auto bg-slate-750 p-2">
        <div className="text-xs font-semibold text-slate-400 mb-2 px-2">FILES</div>
        {fileTree.length === 0 ? (
          <div className="text-xs text-slate-500 px-2">No files yet...</div>
        ) : (
          fileTree.map((node) => <FileTreeNode key={node.path} node={node} />)
        )}
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        {currentFile ? (
          <Editor
            height="100%"
            defaultLanguage="typescript"
            value={currentFileContent}
            onChange={(value) => {
              if (value !== undefined) {
                updateFile(currentFile, value);
              }
            }}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: 'Menlo, Monaco, Courier New, monospace',
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorSmoothCaretAnimation: 'on',
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500">
            <p>Select a file to view its contents</p>
          </div>
        )}
      </div>
    </div>
  );
}
