const { app, BrowserWindow } = require('electron');
const path = require('path');

const BACKGROUND = '#0a0a0a';
const IS_DEV = !app.isPackaged;

// Ідентифікатор застосунку для Windows (панель задач, сповіщення, групування вікон).
app.setAppUserModelId('app.dispersy.desktop');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 940,
    minHeight: 600,
    show: false,
    backgroundColor: BACKGROUND,
    title: 'Dispersy',
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: BACKGROUND, symbolColor: '#8b949e', height: 40 },
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Показуємо вікно лише коли воно реально готове — без білого спалаху.
  win.once('ready-to-show', () => win.show());

  if (IS_DEV) {
    const startedAt = Date.now();
    app.once('browser-window-ready-to-show', () => {
      console.log(`[dispersy] window ready in ${Date.now() - startedAt} ms`);
    });
  }

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  return win;
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
