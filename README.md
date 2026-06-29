# AI Code Generator

A full-stack, AI-powered web development platform that generates code, writes it to an in-browser file system, and runs a live preview of the application without requiring a remote server.

Inspired by platforms like [Bolt.new](https://bolt.new) and [Lovable](https://lovable.dev).

## Features

- 🤖 **AI-Powered Code Generation**: Uses OpenAI or Anthropic to generate complete, production-ready code
- 📝 **Monaco Editor Integration**: Professional code editor with syntax highlighting and auto-completion
- 🎨 **Live Preview**: In-browser preview of your application as you build
- 💻 **Terminal UI**: Real-time terminal output using xterm.js
- 📁 **Virtual File System**: WebContainers API for in-browser Node.js runtime
- 🔄 **Agentic Loop**: AI can create files, update them, and run commands
- 🌐 **No Server Required**: Everything runs in the browser

## Tech Stack

- **Frontend**: Next.js 14 with React 18, TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Code Editor**: @monaco-editor/react
- **Terminal**: xterm.js
- **In-Browser Runtime**: @webcontainer/api
- **AI Orchestration**: Vercel AI SDK with OpenAI/Anthropic
- **State Management**: Zustand
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # AI chat API endpoint
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── page.tsx                  # Main page
├── components/
│   ├── WorkbenchLayout.tsx       # Main split-pane layout
│   ├── ChatPanel.tsx             # AI chat interface
│   ├── EditorPanel.tsx           # Code editor with file tree
│   ├── PreviewPanel.tsx          # Live preview iframe
│   └── TerminalPanel.tsx         # Terminal output
├── hooks/
│   ├── useWebContainer.ts        # WebContainer hook
│   └── useChat.ts                # Chat hook
└── store/
    └── projectStore.ts           # Zustand project state
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI or Anthropic API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/WaltGilead/Ai-code-generator.git
cd Ai-code-generator
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file with your API key:

```bash
OPENAI_API_KEY=your_openai_api_key_here
# or
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Start Chatting**: Describe what you want to build in the left panel
2. **AI Generation**: The AI will generate code, create files, and set up your project
3. **Live Preview**: Watch the application build and preview it in real-time
4. **Edit & Iterate**: Manually edit files in the editor or ask the AI for changes
5. **Terminal Output**: Monitor build logs and command execution in the terminal panel

### Example Prompts

- "Build a React counter app with increment and decrement buttons"
- "Create a todo list application with add, complete, and delete functionality"
- "Make a weather app that fetches data from an API"
- "Build a simple markdown note-taking app"

## Architecture

### The Agentic Loop

1. User sends a request to the AI
2. AI processes the request and calls tools:
   - `createFile`: Creates a new file in the virtual file system
   - `updateFile`: Updates an existing file
   - `runCommand`: Executes terminal commands (npm install, npm run dev, etc.)
3. Each tool call updates both the React state and the WebContainer file system
4. The preview automatically updates when the dev server is running
5. Terminal output streams in real-time to the terminal panel

### WebContainer Integration

- **Cross-Origin Headers**: Configured in `next.config.js` to enable WebContainers
- **File System Sync**: Files are written to both React state and WebContainer virtual FS
- **Process Management**: Commands are spawned in the WebContainer and output is piped to xterm
- **Server URL**: Once a dev server is running, its URL is displayed in the preview

## Key Components

### ChatPanel

- Displays AI-generated messages
- Accepts user input and sends to the AI
- Shows status indicators for background tasks
- Processes tool calls from the AI

### EditorPanel

- File tree sidebar for navigation
- Monaco Editor for code viewing/editing
- Syntax highlighting for multiple languages
- Auto-sync with WebContainer on file changes

### PreviewPanel

- Embedded iframe for live preview
- Displays the running application
- Sandbox restrictions for security

### TerminalPanel

- xterm.js terminal emulator
- Real-time output from WebContainer commands
- Resizable and scrollable

## API Route: `/api/chat`

- **Method**: POST
- **Body**: `{ messages: Array<{role: string; content: string}> }`
- **Response**: Server-sent events stream with AI responses
- **Tools**: `createFile`, `updateFile`, `runCommand`

## Environment Variables

```bash
# Required: Choose one
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Optional: Supabase (for persistence)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Limitations & Future Work

### Current Limitations

- WebContainers runs limited to ~10 minute sessions
- No persistent storage between sessions (without Supabase)
- Limited to Node.js environments
- AI responses are generated based on what's in context

### Future Features

- [ ] Database integration (Supabase for project persistence)
- [ ] Git integration for version control
- [ ] Collaborative editing with real-time sync
- [ ] Multi-file AI editing with context awareness
- [ ] Template library for common project types
- [ ] Custom API key management in UI
- [ ] Project sharing and export
- [ ] Advanced error recovery and debugging
- [ ] Performance profiling tools
- [ ] AI code review and suggestions

## Troubleshooting

### WebContainer fails to boot

- Ensure COOP and COEP headers are set in `next.config.js`
- Check browser console for errors
- WebContainers requires a secure context (HTTPS or localhost)

### AI responses not generating files

- Check that the API key is valid
- Review the system prompt in `/api/chat/route.ts`
- Check browser console for tool parsing errors

### Preview not updating

- Ensure `npm run dev` was executed
- Check terminal for build errors
- Verify the preview URL is correctly set

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Inspired by [Bolt.new](https://bolt.new) and [Lovable](https://lovable.dev)
- Built with [WebContainers](https://webcontainers.io/) by StackBlitz
- AI powered by [Vercel AI SDK](https://sdk.vercel.ai/)
