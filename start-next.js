#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Start Next.js development server
const nextDev = spawn('npx', ['next', 'dev', '-p', '5000'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

nextDev.on('close', (code) => {
  console.log(`Next.js process exited with code ${code}`);
  process.exit(code);
});

process.on('SIGINT', () => {
  nextDev.kill('SIGINT');
});

process.on('SIGTERM', () => {
  nextDev.kill('SIGTERM');
});