import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting Next.js development server...');

// Start Next.js development server
const nextDev = spawn('npx', ['next', 'dev', '-p', '5000'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

nextDev.on('close', (code) => {
  console.log(`Next.js process exited with code ${code}`);
  process.exit(code);
});

nextDev.on('error', (error) => {
  console.error('Failed to start Next.js:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\nShutting down Next.js...');
  nextDev.kill('SIGINT');
});

process.on('SIGTERM', () => {
  nextDev.kill('SIGTERM');
});