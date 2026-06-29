export function generateProjectStructure(projectType: string): { [key: string]: string } {
  const templates: { [key: string]: { [key: string]: string } } = {
    'react-counter': {
      'package.json': JSON.stringify({
        name: 'react-counter',
        version: '1.0.0',
        private: true,
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0',
        },
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview',
        },
      }, null, 2),
      'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React Counter</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
      'src/main.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);`,
      'src/App.tsx': `import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'sans-serif',
    }}>
      <h1>Counter: {count}</h1>
      <div style={{ gap: '10px', display: 'flex' }}>
        <button onClick={() => setCount(count + 1)}>Increment</button>
        <button onClick={() => setCount(count - 1)}>Decrement</button>
        <button onClick={() => setCount(0)}>Reset</button>
      </div>
    </div>
  );
}`,
      'vite.config.ts': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
});`,
    },
    'next-starter': {
      'package.json': JSON.stringify({
        name: 'next-starter',
        version: '1.0.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
        },
        dependencies: {
          next: '^14.0.0',
          react: '^18.2.0',
          'react-dom': '^18.2.0',
        },
      }, null, 2),
      'app/page.tsx': `export default function Home() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
    }}>
      <h1>Welcome to Next.js</h1>
      <p>Edit app/page.tsx to get started</p>
    </main>
  );
}`,
    },
  };

  return templates[projectType] || {};
}
