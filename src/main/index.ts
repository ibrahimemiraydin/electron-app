import { app, BrowserWindow, ipcMain, Tray, Menu } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

function createWindow(): void {
  // Create the browser window for URL entry
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  // Menü çubuğunu tamamen kaldır
  mainWindow.setMenuBarVisibility(false);

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.webContents.on('did-fail-load', (_, errorCode, errorDescription, validatedURL) => {
    mainWindow?.webContents.send('load-error', {
      errorCode,
      errorDescription,
      validatedURL,
    });
  });

  // Initial page (URL input form page)
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // Handle opening a new window (when a URL is provided)
  ipcMain.handle('open-url', (_event, url) => {
    // Create a new window for the URL
    const newWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      show: false,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
      },
    });

    newWindow.setMenuBarVisibility(false); // Yeni pencerede de menüyü gizle
    newWindow.loadURL(url); // Open the URL in the new window
    newWindow.on('ready-to-show', () => {
      newWindow.show();
    });

    return { action: 'deny' }; // Prevent opening in the current window
  });

  // Pencere küçültüldüğünde tray simgesi oluştur
  mainWindow.on('minimize', () => {
    console.log('Window was minimized!');
    mainWindow?.hide();
    createTray();
  });

  mainWindow.on('close', (event) => {
    if (app.quitting) {
      mainWindow = null;
    } else {
      event.preventDefault();
      mainWindow?.hide();
      createTray();
    }
  });
}

function createTray(): void {
  if (tray) return; // Eğer tray zaten varsa yeniden oluşturma

  const trayIcon = join(__dirname, '../../build/icon.png'); // Tray için simge dosyası
  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Aç',
      click: () => {
        mainWindow?.show();
      },
    },
    {
      label: 'Kapat',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('Uygulama'); // Tray simgesi açıklaması

  tray.on('double-click', () => {
    mainWindow?.show();
  });

  // Uygulama tamamen kapatıldığında tray temizle
  tray.on('destroy', () => {
    tray = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  app.quitting = true;  // `quitting` özelliğini true yapıyoruz
});
