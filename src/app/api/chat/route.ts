import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const createFileTool = tool({
  description: 'Create a new file in the project',
  parameters: z.object({
    path: z.string().describe('The file path (e.g., src/index.tsx)'),
    content: z.string().describe('The file content'),
  }),
  execute: async ({ path, content }) => {
    return { success: true, path, message: `Created file: ${path}` };
  },
});

const updateFileTool = tool({
  description: 'Update an existing file in the project',
  parameters: z.object({
    path: z.string().describe('The file path'),
    content: z.string().describe('The new file content'),
  }),
  execute: async ({ path, content }) => {
    return { success: true, path, message: `Updated file: ${path}` };
  },
});

const runCommandTool = tool({
  description: 'Run a terminal command in the WebContainer',
  parameters: z.object({
    command: z.string().describe('The command to run (e.g., npm install, npm run dev)'),
  }),
  execute: async ({ command }) => {
    return { success: true, command, message: `Executing: ${command}` };
  },
});

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    const result = streamText({
      model: openai('gpt-4-turbo'),
      messages,
      tools: {
        createFile: createFileTool,
        updateFile: updateFileTool,
        runCommand: runCommandTool,
      },
      system: `You are an expert full-stack web developer. Your task is to help users build web applications by generating complete, production-ready code.

When a user describes what they want to build:
1. First, analyze their request and create a plan
2. Generate all necessary files (HTML, CSS, JavaScript/TypeScript, config files)
3. Use the createFile tool to create each file with complete, working code
4. Use the runCommand tool to install dependencies and start the dev server
5. Provide clear explanations of what you're building

Always:
- Generate complete, working code without placeholders
- Include proper error handling and validation
- Use modern best practices and frameworks
- Create a package.json if building a Node.js project
- Generate a Dockerfile if the project needs containerization
- Ensure all code is properly formatted and well-commented

When using tools:
- Use createFile for new files
- Use updateFile to modify existing files
- Use runCommand for npm install, npm run dev, etc.
- Always run 'npm install' before 'npm run dev' for Node projects`,
      maxTokens: 4096,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
