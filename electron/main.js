import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import waitOn from 'wait-on';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

let backendProcess;
let frontendProcess;

const spawnProcess = (command, args, cwd) => spawn(command, args, {
  cwd,
  shell: process.platform === 'win32',
  stdio: 'inherit',
});

const createWindow = async () => {
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: '#0f172a',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  await win.loadURL('http://localhost:5173');
};

const startServices = async () => {
  backendProcess = spawnProcess('npm', ['run', 'start'], backendDir);
  frontendProcess = spawnProcess('npm', ['run', 'preview', '--', '--host', '0.0.0.0', '--port', '5173'], frontendDir);

  await waitOn({
    resources: ['http://localhost:4000/api/health', 'http://localhost:5173'],
    timeout: 60000,
  });
};

app.whenReady().then(async () => {
  await startServices();
  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  backendProcess?.kill();
  frontendProcess?.kill();
});
