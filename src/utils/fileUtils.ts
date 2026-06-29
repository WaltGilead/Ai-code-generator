export interface ToolCall {
  type: 'createFile' | 'updateFile' | 'runCommand';
  path?: string;
  content?: string;
  command?: string;
}

export function parseToolCalls(content: string): ToolCall[] {
  const toolCalls: ToolCall[] = [];
  
  // Pattern to match tool calls in various formats
  const patterns = [
    /createFile\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/g,
    /updateFile\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/g,
    /runCommand\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];

  // Try to parse JSON-formatted tool calls
  try {
    const jsonMatches = content.match(/```json([\s\S]*?)```/g) || [];
    jsonMatches.forEach((match) => {
      const jsonStr = match.replace(/```json|```/g, '').trim();
      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed.type && (parsed.type === 'createFile' || parsed.type === 'updateFile' || parsed.type === 'runCommand')) {
          toolCalls.push(parsed);
        }
      } catch (e) {
        // Not valid JSON, continue
      }
    });
  } catch (e) {
    // Continue to regex parsing
  }

  return toolCalls;
}

export function extractFileLanguage(filePath: string): string {
  const ext = filePath.split('.').pop() || '';
  const languageMap: { [key: string]: string } = {
    'ts': 'typescript',
    'tsx': 'typescript',
    'js': 'javascript',
    'jsx': 'javascript',
    'json': 'json',
    'css': 'css',
    'html': 'html',
    'md': 'markdown',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'go': 'go',
    'rs': 'rust',
    'sql': 'sql',
    'yaml': 'yaml',
    'yml': 'yaml',
    'xml': 'xml',
    'sh': 'shell',
    'bash': 'shell',
  };
  return languageMap[ext] || 'plaintext';
}

export async function formatFileContent(content: string, language: string): Promise<string> {
  // Basic formatting - can be extended with prettier/eslint
  switch (language) {
    case 'json':
      try {
        return JSON.stringify(JSON.parse(content), null, 2);
      } catch (e) {
        return content;
      }
    default:
      return content;
  }
}
