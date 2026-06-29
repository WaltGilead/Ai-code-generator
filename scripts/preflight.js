#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  '.env.local',
  'src/app/page.tsx',
  'src/app/api/chat/route.ts',
  'next.config.js',
];

const requiredEnvVars = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'];

console.log('🔍 Running pre-flight checks...\n');

let hasErrors = false;

// Check for required files
console.log('📁 Checking required files...');
for (const file of requiredFiles) {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else if (file === '.env.local') {
    console.log(`  ⚠️  ${file} (will be created)`);
  } else {
    console.log(`  ❌ ${file}`);
    hasErrors = true;
  }
}

// Check for environment variables
console.log('\n🔑 Checking environment variables...');
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const hasApiKey = requiredEnvVars.some((v) => envContent.includes(v));
  if (hasApiKey) {
    console.log(`  ✅ API key configured`);
  } else {
    console.log(`  ❌ No API key found. Add OPENAI_API_KEY or ANTHROPIC_API_KEY to .env.local`);
    hasErrors = true;
  }
} else {
  console.log(`  ⚠️  .env.local not found. Create it with your API key.`);
}

// Check Node version
console.log('\n🔧 Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion >= 18) {
  console.log(`  ✅ Node.js ${nodeVersion}`);
} else {
  console.log(`  ❌ Node.js 18+ required (you have ${nodeVersion})`);
  hasErrors = true;
}

// Check npm version
console.log('\n📦 Checking npm version...');
const npmVersion = require('child_process')
  .execSync('npm --version')
  .toString()
  .trim();
const npmMajor = parseInt(npmVersion.split('.')[0]);
if (npmMajor >= 9) {
  console.log(`  ✅ npm ${npmVersion}`);
} else {
  console.log(`  ⚠️  npm 9+ recommended (you have ${npmVersion})`);
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Some checks failed. Please fix the issues above.');
  process.exit(1);
} else {
  console.log('✅ All checks passed! Ready to start.');
  console.log('\nRun: npm run dev');
}
