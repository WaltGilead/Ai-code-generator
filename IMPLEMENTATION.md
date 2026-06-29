# Implementation Guide

## Phase 1: Scaffolding ✅

Project structure has been set up with:
- Next.js 14 with TypeScript
- Tailwind CSS configuration
- Directory structure for components, hooks, utils
- Basic split-pane UI layout

## Phase 2: Environment Setup ✅

WebContainer integration includes:
- Proper COOP/COEP headers in `next.config.js`
- `useWebContainer` hook for initialization
- File system state management with Zustand
- Terminal output piping

## Phase 3: AI Orchestration ✅

AI API setup includes:
- `/api/chat` route with Vercel AI SDK
- Tool definitions: `createFile`, `updateFile`, `runCommand`
- System prompt for code generation
- Streaming responses

## Phase 4: The Bridge ✅

Tool execution pipeline:
- Chat component processes AI responses
- `useChatWithTools` hook handles tool execution
- Files written to both React state and WebContainer FS
- Terminal output displayed in real-time
- Preview updates when dev server starts

## Connecting Components

### File Creation Flow

```
User Request
    ↓
AI generates code with createFile tool
    ↓
Tool call parsed from response
    ↓
File written to WebContainer FS
    ↓
File added to project store
    ↓
EditorPanel updates file tree
    ↓
Preview iframe updated
```

### Command Execution Flow

```
AI calls runCommand (e.g., "npm install")
    ↓
Command spawned in WebContainer
    ↓
Output piped to xterm
    ↓
Output also stored in project store
    ↓
TerminalPanel displays output
    ↓
If server starts, preview URL extracted
    ↓
PreviewPanel iframe source updated
```

## Testing the System

### 1. Local Development

```bash
npm run dev
```

Open http://localhost:3000

### 2. Test Basic Chat

Type in the chat: "Build a React counter"

Expected:
- AI generates code
- Files appear in editor
- Terminal shows commands running

### 3. Test File Creation

The system should:
- Create package.json
- Create index.html
- Create src/main.tsx
- Create vite.config.ts

### 4. Test Command Execution

Watch for:
- "npm install" executes
- Dependencies install
- "npm run dev" starts server
- Preview URL appears

### 5. Test Live Preview

The application should:
- Render in the preview iframe
- Update when files change
- Show interactive elements

## Key Integration Points

### 1. ChatPanel → ProjectStore → EditorPanel

```typescript
// ChatPanel processes AI response
const toolCalls = parseToolCalls(aiResponse);

// Updates project store
projectStore.createFile(path, content);

// EditorPanel reads from store
const { files } = useProjectStore();
```

### 2. WebContainer → TerminalPanel

```typescript
// Command execution
await webContainer.runCommand(command, (output) => {
  projectStore.addTerminalOutput(output);
});

// Terminal displays output
const { terminalOutput } = useProjectStore();
```

### 3. WebContainer → PreviewPanel

```typescript
// After dev server starts
const serverUrl = webContainer.getServerUrl(3000);
projectStore.setPreviewUrl(serverUrl);

// Preview iframe loads URL
<iframe src={iframeSrc} />
```

## Debugging

### Check WebContainer Status

```typescript
const { isReady, error } = useWebContainer();
console.log('WebContainer ready:', isReady);
console.log('WebContainer error:', error);
```

### Verify Tool Calls

Check browser console for:
- `parseToolCalls` output
- Tool execution logs
- WebContainer commands

### Monitor Terminal Output

Check TerminalPanel for:
- npm install output
- Build logs
- Error messages

## Next Steps

1. **Environment Variables**: Add OpenAI/Anthropic API keys to `.env.local`
2. **Test Deployment**: Deploy to Vercel
3. **Add Features**: Error recovery, project saving, templates
4. **Optimize**: Performance improvements, caching
5. **Documentation**: API docs, user guide

## Common Issues & Solutions

### Issue: WebContainer won't boot
**Solution**: Check that COOP/COEP headers are set. Verify browser supports WebContainers (Chrome 89+, Firefox 79+)

### Issue: Files don't appear in editor
**Solution**: Check `projectStore.createFile()` is called. Verify file tree logic in `EditorPanel`

### Issue: Preview doesn't load
**Solution**: Ensure dev server started. Check terminal for errors. Verify preview URL is accessible

### Issue: AI doesn't generate code
**Solution**: Check API key. Review system prompt. Check console for errors in `/api/chat`
