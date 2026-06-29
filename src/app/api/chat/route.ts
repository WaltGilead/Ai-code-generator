import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { streamText, tool, convertToCoreMessages } from 'ai';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

// Define tools with proper schemas
const tools = {
  createFile: tool({
    description: 'Create a new file in the WebContainer project',
    parameters: z.object({
      path: z.string().describe('The file path (e.g., src/index.tsx, package.json)'),
      content: z.string().describe('The complete file content'),
    }),
    execute: async ({ path, content }) => {
      return {
        success: true,
        message: `File created: ${path}`,
        path,
        preview: content.substring(0, 100),
      };
    },
  }),

  updateFile: tool({
    description: 'Update an existing file in the WebContainer project',
    parameters: z.object({
      path: z.string().describe('The file path'),
      content: z.string().describe('The new file content'),
    }),
    execute: async ({ path, content }) => {
      return {
        success: true,
        message: `File updated: ${path}`,
        path,
      };
    },
  }),

  runCommand: tool({
    description: 'Execute a terminal command in the WebContainer',
    parameters: z.object({
      command: z
        .string()
        .describe(
          'The command to run (e.g., npm install, npm run dev, yarn build). Must be a valid bash command.'
        ),
    }),
    execute: async ({ command }) => {
      return {
        success: true,
        message: `Command queued: ${command}`,
        command,
      };
    },
  }),
};

const systemPrompt = `You are an expert full-stack web developer with deep knowledge of modern web technologies.

Your task is to help users build complete, production-ready web applications by generating code and managing the development environment.

## Instructions

1. **Understand the Request**: Carefully analyze what the user wants to build
2. **Plan the Architecture**: Design a complete project structure before generating code
3. **Generate Complete Code**: Always provide fully functional code without placeholders
4. **Use Tools Strategically**:
   - Use createFile to create new files with complete content
   - Use updateFile to modify existing files
   - Use runCommand for dependency installation and starting dev servers
5. **Follow Best Practices**: Write clean, well-commented, production-ready code

## Project Structure Guidelines

- Always create a package.json with all necessary dependencies
- Create proper project structure (src/, public/, etc.)
- Include configuration files (tsconfig.json, vite.config.ts, etc.)
- Add .gitignore and README.md

## Technology Stack Defaults

- Frontend: React 18 with TypeScript
- Bundler: Vite (recommended) or Next.js
- Styling: Tailwind CSS
- Build Tool: npm or yarn

## Important Rules

1. **Complete Code Only**: Never generate incomplete code, TODOs, or placeholders
2. **Error Handling**: Include proper error handling and validation
3. **No Hallucinations**: Only suggest commands that work in Node.js environments
4. **Initialize First**: Always run npm install before npm run dev
5. **Port Configuration**: Use port 3000 for dev servers
6. **Streaming Responses**: Explain what you're doing as you work

## Example Workflow

When asked to "build a counter app":
1. Create package.json with React and necessary dependencies
2. Create index.html as entry point
3. Create src/main.tsx for React setup
4. Create src/App.tsx with counter component
5. Create vite.config.ts for build configuration
6. Run "npm install" to install dependencies
7. Run "npm run dev" to start the development server
8. Explain the application features and how to use it

## Output Format

When creating/updating files, use this format:

\`\`\`json
{
  "type": "createFile",
  "path": "src/App.tsx",
  "content": "// complete file content here"
}
\`\`\`

Always provide file contents as complete, executable code.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    // Check for API keys
    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!openaiKey && !anthropicKey) {
      return NextResponse.json(
        { error: 'No API keys configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY' },
        { status: 500 }
      );
    }

    // Use OpenAI by default, fallback to Anthropic
    const model = openaiKey ? openai('gpt-4-turbo') : anthropic('claude-3-5-sonnet-20241022');

    const result = streamText({
      model,
      messages: convertToCoreMessages(messages),
      tools,
      system: systemPrompt,
      maxTokens: 4096,
      temperature: 0.7,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);

    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('API') ? 401 : 500;

    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
