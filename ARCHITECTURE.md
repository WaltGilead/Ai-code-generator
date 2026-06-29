# Architecture & Advanced Topics

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     AI Code Generator                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐              ┌──────────────┐             │
│  │ Chat Panel   │              │ Editor Panel │             │
│  │ - Input      │              │ - File Tree  │             │
│  │ - Messages   │              │ - Monaco     │             │
│  │ - Status     │              │ - Syntax HL  │             │
│  └────────┬─────┘              └──────────────┘             │
│           │                                                  │
│           │ AI Response                                      │
│           ▼                                                  │
│  ┌─────────────────────────────────────┐                   │
│  │   Tool Call Processing Pipeline      │                   │
│  │ ┌─────────────────────────────────┐ │                   │
│  │ │ 1. Parse JSON from Response     │ │                   │
│  │ ├─────────────────────────────────┤ │                   │
│  │ │ 2. Execute Tool (create/update) │ │                   │
│  │ ├─────────────────────────────────┤ │                   │
│  │ │ 3. Update React State           │ │                   │
│  │ ├─────────────────────────────────┤ │                   │
│  │ │ 4. Write to WebContainer FS     │ │                   │
│  │ ├─────────────────────────────────┤ │                   │
│  │ │ 5. Execute Commands             │ │                   │
│  │ └─────────────────────────────────┘ │                   │
│  └───────┬──────────────────────────────┘                   │
│          │                                                   │
│   ┌──────▼────────┐        ┌──────────────┐                │
│   │ Project Store │        │ Preview Panel│                │
│   │ (Zustand)     │        │ - iframe     │                │
│   │ - Files       │        │ - Dev Server │                │
│   │ - Terminal    │        │ - Live App   │                │
│   └────────────────┘        └──────────────┘                │
│                                                              │
│   ┌──────────────────┐     ┌──────────────┐                │
│   │ Terminal Panel   │     │ WebContainer │                │
│   │ - xterm.js       │     │ - Virtual FS │                │
│   │ - Output Stream  │     │ - npm/node   │                │
│   │ - Build Logs     │     │ - Dev Server │                │
│   └──────────────────┘     └──────────────┘                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
        │
        │ HTTP/API Calls
        ▼
    /api/chat (Next.js)
        │
        ├─► Vercel AI SDK
        │
        ├─► OpenAI API / Anthropic API
        │
        └─► Tool Definitions
            ├─ createFile
            ├─ updateFile
            └─ runCommand
```

## Data Flow: Building a Counter App

```
User Input: "Build a React counter"
    ↓
[/api/chat]
    ├─ System Prompt: "You are an expert developer"
    ├─ Message History
    ├─ Tool Definitions
    └─ Stream Response
    ↓
AI Response with Tool Calls:
{
  "type": "createFile",
  "path": "package.json",
  "content": "..."
}
    ↓
[ChatPanel]
    ├─ Parse JSON
    ├─ Extract Tool Call
    └─ Execute: webContainer.writeFile()
    ↓
[WebContainer]
    ├─ Write to Virtual FS
    ├─ Terminal: "$ npm install"
    ├─ Terminal: "$ npm run dev"
    └─ Start Dev Server on port 3000
    ↓
[ProjectStore]
    ├─ Update files state
    ├─ Update terminalOutput
    └─ Set previewUrl = "https://localhost:3000"
    ↓
[UI Updates]
    ├─ EditorPanel: Show file tree + code
    ├─ TerminalPanel: Display output
    └─ PreviewPanel: Load iframe with app
    ↓
[User sees live counter app in preview]
```

## State Management (Zustand)

### ProjectStore Structure

```typescript
interface ProjectState {
  // Data
  files: Map<string, string>              // path → content
  currentFile: string | null              // selected file path
  isRunning: boolean                      // is dev server running
  previewUrl: string | null               // server URL
  terminalOutput: string                  // all terminal output
  
  // Actions
  createFile: (path, content) => void
  updateFile: (path, content) => void
  deleteFile: (path) => void
  setCurrentFile: (path) => void
  setIsRunning: (boolean) => void
  setPreviewUrl: (url) => void
  addTerminalOutput: (output) => void
  clearTerminalOutput: () => void
  getFileTree: () => FileNode[]            // hierarchical tree
}
```

## WebContainer Integration

### Boot Sequence

```typescript
const instance = await WebContainer.boot();
// Returns isolated Node.js runtime in browser

// Check capabilities
instance.fs              // Virtual file system
instance.spawn()         // Execute commands
instance.getNetworkUrl() // Get server URL
```

### File System Operations

```typescript
// Write file
await instance.fs.writeFile('src/App.tsx', code);

// Read file
const content = await instance.fs.readFile('src/App.tsx', 'utf-8');

// Create directory
await instance.fs.mkdir('src', { recursive: true });

// List directory
const files = await instance.fs.readdir('src');
```

### Command Execution

```typescript
// Spawn process
const process = await instance.spawn('sh', ['-c', 'npm install']);

// Stream output
process.output.pipeTo(new WritableStream({
  write: (chunk) => console.log(chunk)
}));

// Wait for completion
const exitCode = await process.exit;
```

## AI Tool Calling Flow

### Tool Definition

```typescript
const createFileTool = tool({
  description: 'Create a new file',
  parameters: z.object({
    path: z.string(),
    content: z.string(),
  }),
  execute: async ({ path, content }) => ({
    success: true,
    message: `File created: ${path}`,
  }),
});
```

### Tool Invocation

AI decides to call tools based on:
1. User request
2. System prompt guidance
3. Available tools and their descriptions
4. Response format expectations

### Client-Side Processing

```typescript
// 1. Receive AI response with tool calls
const aiResponse = "```json\n{\"type\":\"createFile\",...}\n```";

// 2. Parse JSON from code blocks
const toolCalls = msg.content.match(/```json([\s\S]*?)```/g);

// 3. Execute each tool
for (const call of toolCalls) {
  if (call.type === 'createFile') {
    await webContainer.writeFile(call.path, call.content);
  }
}

// 4. Update UI
projectStore.updateFile(path, content);
editorPanel.refreshFileTree();
```

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Load editor only when tab active
2. **Memoization**: Prevent unnecessary re-renders
3. **Stream Responses**: Stream AI responses as they arrive
4. **Async Operations**: Don't block UI during heavy ops
5. **Debouncing**: Debounce rapid file edits

### Memory Management

```typescript
// Good: Only load one file in editor at a time
const content = files.get(currentFile);

// Bad: Load all files in state
files.values();  // Could be huge

// Good: Clear large strings when done
projectStore.clearTerminalOutput();
```

## Error Handling Strategy

### Error Types

```typescript
// WebContainer Errors
if (!webContainer.isReady) {
  throw new Error('WebContainer not initialized');
}

// File Operation Errors
try {
  await writeFile(path, content);
} catch (error) {
  if (error.code === 'ENOENT') {
    // File not found
  }
}

// Command Execution Errors
if (exitCode !== 0) {
  // Command failed
}

// AI API Errors
if (error.status === 401) {
  // Invalid API key
}
```

### User Feedback

```typescript
// Display errors in UI
<div className="error-banner">
  {error && (
    <Alert>
      <AlertCircle />
      <p>{error.message}</p>
    </Alert>
  )}
</div>

// Show status updates
<div className="status">
  {status && (
    <div className="flex gap-2">
      <Loader />
      <p>{status}</p>
    </div>
  )}
</div>
```

## Extension Points

### Adding New Tools

1. Define tool in `/api/chat/route.ts`
2. Add execution logic in tool's `execute` function
3. Handle client-side in `ChatPanel.tsx`
4. Update UI to reflect changes

### Adding New Templates

1. Add to `templates.ts`
2. Reference in AI system prompt
3. Create initial files

### Custom Components

1. Create component in `components/`
2. Add to `WorkbenchLayout`
3. Connect to Zustand store

## Testing

### Component Testing

```typescript
// Test file operations
const { createFile, files } = projectStore.getState();
createFile('test.txt', 'content');
expect(files.get('test.txt')).toBe('content');
```

### Integration Testing

```typescript
// Test full flow
1. Send prompt
2. Parse AI response
3. Create files
4. Run commands
5. Check preview
```

## Future Enhancements

1. **Database**: Persist projects to Supabase
2. **Auth**: User accounts and project sharing
3. **Version Control**: Git integration
4. **Collaboration**: Real-time multi-user editing
5. **Extensions**: Plugin system for custom tools
6. **Performance**: Worker threads for heavy tasks
7. **Analytics**: Track usage and popular templates
