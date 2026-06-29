# Setup & Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Prerequisites

```bash
# Check Node.js version (need 18+)
node --version

# Check npm version (need 9+)
npm --version
```

### 2. Clone & Install

```bash
git clone https://github.com/WaltGilead/Ai-code-generator.git
cd Ai-code-generator
npm install
```

### 3. Configure API Key

```bash
# Copy example config
cp .env.local.example .env.local

# Edit with your API key
# Option A: OpenAI
echo "OPENAI_API_KEY=sk-your-key-here" >> .env.local

# Option B: Anthropic
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" >> .env.local
```

### 4. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### 5. Test It

Try this prompt in the chat:

```
Build a React counter app with increment, decrement, and reset buttons
```

## 📝 Example Prompts

### Simple Projects

- "Create a to-do list application"
- "Build a simple calculator"
- "Make a color picker app"
- "Create a stopwatch"

### Intermediate Projects

- "Build a weather app that fetches from an API"
- "Create a markdown editor"
- "Make a note-taking app with local storage"
- "Build a quiz application"

### Advanced Projects

- "Create a real-time chat interface"
- "Build a task management app with categories"
- "Make a portfolio template"
- "Create a blog with markdown support"

## 🛠️ Understanding the Interface

### Left Panel: Chat

- **Input**: Type your project description
- **Output**: AI responses and status updates
- **Status**: Shows what AI is doing (creating files, running commands)

### Right Panel: Workbench

#### Editor Tab
- **File Tree**: Navigate project files
- **Code Editor**: View and edit code with syntax highlighting
- **Changes sync**: Auto-syncs to WebContainer

#### Preview Tab
- **Live Application**: Running app preview
- **Real-time Updates**: Updates as you make changes
- **Interactive**: Full functionality of your app

#### Terminal Tab
- **Command Output**: See npm install, build logs
- **Error Messages**: Debugging information
- **Server Status**: Shows when dev server is running

## 🔧 Customization

### Change AI Model

Edit `src/app/api/chat/route.ts`:

```typescript
// Use Claude instead of GPT-4
const model = anthropic('claude-3-5-sonnet-20241022');
```

### Modify System Prompt

Edit the `systemPrompt` in `src/app/api/chat/route.ts` to change:
- Code style preferences
- Default technology stack
- Component structure
- Naming conventions

### Add Custom Templates

Edit `src/utils/templates.ts` to add new project templates:

```typescript
'my-template': {
  'package.json': '...',
  'src/App.tsx': '...',
  // ...
}
```

## 🚨 Troubleshooting

### "WebContainer failed to boot"

1. Check browser compatibility (Chrome 89+, Firefox 79+)
2. Clear browser cache
3. Try incognito/private mode
4. Check browser console for errors

### "API key not found"

1. Verify `.env.local` exists
2. Check API key is correctly set
3. Restart dev server after changing `.env.local`
4. Check browser console for errors

### "Chat not responding"

1. Verify internet connection
2. Check API rate limits on your provider
3. Try shorter, simpler prompts
4. Check browser console for errors

### "Preview not loading"

1. Check Terminal tab for build errors
2. Verify dev server started (look for "npm run dev" in terminal)
3. Wait 5-10 seconds for dev server to fully start
4. Refresh preview tab

## 📚 File Structure Reference

```
src/
├── app/
│   ├── api/chat/route.ts          ← AI endpoint
│   ├── layout.tsx                 ← Root layout
│   ├── globals.css                ← Global styles
│   └── page.tsx                   ← Main page
├── components/
│   ├── WorkbenchLayout.tsx        ← Main layout
│   ├── ChatPanel.tsx              ← Chat UI
│   ├── EditorPanel.tsx            ← Code editor
│   ├── PreviewPanel.tsx           ← Preview iframe
│   └── TerminalPanel.tsx          ← Terminal UI
├── hooks/
│   ├── useWebContainer.ts         ← Container runtime
│   ├── useChat.ts                 ← Chat hook
│   └── useChatWithTools.ts        ← Tool execution
├── utils/
│   ├── fileUtils.ts               ← File utilities
│   ├── errorHandling.ts           ← Error handling
│   └── templates.ts               ← Project templates
└── store/
    └── projectStore.ts            ← State management
```

## 🔐 Security Notes

1. **API Keys**: Never commit `.env.local` to Git
2. **Client-Side**: Never send sensitive data from browser
3. **Validation**: Always validate user input
4. **Rate Limiting**: Implement rate limits in production
5. **Content Security**: Use iframe sandbox attributes

## 📖 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [WebContainers](https://webcontainers.io/)
- [Vercel AI SDK](https://sdk.vercel.ai/)

## 💡 Tips & Tricks

### Faster Development

1. Use specific, detailed prompts for better results
2. Ask AI to add features incrementally
3. Use Terminal tab to debug build issues
4. Edit files manually for quick changes

### Better Results

1. "Build a React app with TypeScript" → More type-safe code
2. "Use Tailwind for styling" → Consistent design system
3. "Include error handling" → More robust code
4. "Add comments" → Self-documenting code

### Debugging

1. Check Terminal for error messages
2. Open browser DevTools (F12)
3. Look at Network tab for API calls
4. Check Console for JavaScript errors

## 🤝 Contributing

Want to improve the project?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - Feel free to use this project!

## 🆘 Need Help?

1. Check the [IMPLEMENTATION.md](./IMPLEMENTATION.md) guide
2. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for hosting
3. Check browser console for errors
4. Review GitHub Issues for similar problems

## 🎉 You're Ready!

Start building amazing web apps with AI! 🚀
