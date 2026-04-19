#!/usr/bin/env node
import { existsSync, mkdirSync, copyFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = __dirname;
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');
const databaseDir = path.join(rootDir, 'database');
const backendDataDir = path.join(backendDir, 'data');

const runCommand = (command, args, cwd) => new Promise((resolve, reject) => {
  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  child.on('close', (code) => {
    if (code === 0) {
      resolve();
      return;
    }
    reject(new Error(`${command} ${args.join(' ')} failed with code ${code}`));
  });
});

const ensureEnvFile = (dir) => {
  const envPath = path.join(dir, '.env');
  const examplePath = path.join(dir, '.env.example');
  if (!existsSync(envPath) && existsSync(examplePath)) {
    copyFileSync(examplePath, envPath);
    console.log(`Created ${path.relative(rootDir, envPath)} from .env.example`);
  }
};

const ensureInstall = async (dir, label) => {
  const nodeModulesPath = path.join(dir, 'node_modules');
  if (existsSync(nodeModulesPath)) {
    console.log(`${label} dependencies already installed.`);
    return;
  }

  console.log(`Installing ${label} dependencies...`);
  await runCommand('npm', ['install'], dir);
};

const startApp = async () => {
  console.log('\nStarting backend and frontend...\n');
  await runCommand('npm', ['run', 'dev'], rootDir);
};

const main = async () => {
  try {
    console.log('🦷 Dentist Clinic Management System setup started...');

    mkdirSync(databaseDir, { recursive: true });
    mkdirSync(backendDataDir, { recursive: true });

    ensureEnvFile(backendDir);
    ensureEnvFile(frontendDir);

    await ensureInstall(rootDir, 'root');
    await ensureInstall(backendDir, 'backend');
    await ensureInstall(frontendDir, 'frontend');

    console.log('Initializing SQLite database...');
    await runCommand('npm', ['run', 'init-db'], rootDir);

    console.log('\n✅ Setup complete. Database initialized and sample data seeded.');
    console.log(`Database folders ready:`);
    console.log(`- ${path.relative(rootDir, databaseDir)}`);
    console.log(`- ${path.relative(rootDir, backendDataDir)}`);

    await startApp();
  } catch (error) {
    console.error('\n❌ Setup failed.');
    console.error(error.message);
    process.exit(1);
  }
};

main();
