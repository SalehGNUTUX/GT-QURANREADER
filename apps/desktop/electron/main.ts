import { app, BrowserWindow, ipcMain, shell, nativeImage } from 'electron';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { registerDataIpc } from './ipc/data';
import { registerDownloadIpc } from './ipc/download';
import { registerStorageIpc } from './ipc/storage';

// CJS: __dirname و __filename متاحان كـ globals — لا حاجة لـ fileURLToPath/import.meta.

const isDev = process.env.NODE_ENV === 'development';
const VITE_DEV_URL = 'http://localhost:5173';

// app.setName قبل whenReady() — يحدد WM_CLASS على X11/Wayland ليطابق .desktop file.
// مهم لكي تظهر الأيقونة في شريط المهام بدل شعار X.
app.setName('GT-QURANREADER');
// إضافي: تعيين العنوان للنوافذ على X11.
if (process.platform === 'linux') {
  process.title = 'GT-QURANREADER';
}

let mainWindow: BrowserWindow | null = null;

// أبحث عن الأيقونة في المسارات المحتملة (تختلف بين dev و AppImage).
function resolveIconPath(): string | undefined {
  const candidates = [
    path.join(process.resourcesPath || '', 'icon.png'),
    path.join(__dirname, '../build/icon.png'),
    path.join(__dirname, '../../build/icon.png'),
    path.join(__dirname, '../public/icon.png'),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return undefined;
}

function createWindow(): void {
  const iconPath = resolveIconPath();
  const icon = iconPath ? nativeImage.createFromPath(iconPath) : undefined;

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 380,
    minHeight: 600,
    title: 'GT-QURANREADER',
    backgroundColor: '#1c1410',
    icon,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    autoHideMenuBar: true,
  });

  // setIcon ثانية بعد الإنشاء — يضمن ظهور الأيقونة في شريط المهام (X11).
  if (icon && !icon.isEmpty()) {
    mainWindow.setIcon(icon);
  }

  if (isDev) {
    mainWindow.loadURL(VITE_DEV_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  registerDataIpc(ipcMain);
  registerDownloadIpc(ipcMain);
  registerStorageIpc(ipcMain);

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
