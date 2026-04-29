import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { startServer } from '../backend/src/server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend');
const isDev = !app.isPackaged;

let mainWindow;
let backendServer;
let frontendProcess;

const spawnFrontendDevServer = () => spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173'], {
  cwd: frontendDir,
  shell: process.platform === 'win32',
  stdio: 'inherit',
});

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: '#0f172a',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    await mainWindow.loadURL('http://127.0.0.1:5173');
    mainWindow.webContents.openDevTools();
    mainWindow.webContents.setZoomFactor(1.0);
    return;
  }

  await mainWindow.loadFile(path.join(frontendDir, 'dist', 'index.html'));
  // Uncomment for debugging in production
  // mainWindow.webContents.openDevTools();
  mainWindow.webContents.setZoomFactor(1.0);
};

const startAppServices = async () => {
  process.env.NODE_ENV = isDev ? 'development' : 'production';
  process.env.DB_PATH = process.env.DB_PATH || '../database/clinic.sqlite';
  process.env.FRONTEND_URL = isDev ? 'http://127.0.0.1:5173' : 'app://-';

  try {
    backendServer = await startServer();
    console.log('Backend server started successfully');
  } catch (error) {
    console.error('Failed to start backend server:', error);
    throw error;
  }

  if (isDev) {
    frontendProcess = spawnFrontendDevServer();
    const { default: waitOn } = await import('wait-on');
    await waitOn({
      resources: ['http://127.0.0.1:3000/api/health', 'http://127.0.0.1:5173'],
      timeout: 60000,
    });
  }
};

app.whenReady().then(async () => {
  await startAppServices();
  await createWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', async () => {
  frontendProcess?.kill();
  if (backendServer) {
    await new Promise((resolve) => backendServer.close(resolve));
  }
});
