const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const http = require('http');
const https = require('https');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#020617',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  // If in development mode with dev server
  const startUrl = process.env.ELECTRON_START_URL || (
    app.isPackaged
      ? `file://${path.join(__dirname, '../dist/index.html')}`
      : 'http://localhost:5173'
  );

  mainWindow.loadURL(startUrl);

  // Open external links in default system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.handle('get-platform-info', () => {
  return {
    isElectron: true,
    platform: process.platform,
    version: app.getVersion(),
    nodeVersion: process.versions.node,
    electronVersion: process.versions.electron
  };
});

// Direct native HTTP/HTTPS request without browser CORS limitations
ipcMain.handle('send-request', async (event, options) => {
  const { url, method = 'GET', headers = {}, body = null } = options;
  const startTime = Date.now();

  try {
    const fetchOptions = {
      method: method.toUpperCase(),
      headers: headers
    };

    if (body && !['GET', 'HEAD'].includes(method.toUpperCase())) {
      fetchOptions.body = body;
    }

    const response = await fetch(url, fetchOptions);
    const duration = Date.now() - startTime;

    const responseHeaders = {};
    response.headers.forEach((val, key) => {
      responseHeaders[key] = val;
    });

    const contentType = response.headers.get('content-type') || '';
    let responseData = '';
    let size = 0;

    if (contentType.includes('application/json')) {
      const json = await response.json();
      responseData = JSON.stringify(json, null, 2);
      size = Buffer.byteLength(responseData, 'utf8');
    } else {
      responseData = await response.text();
      size = Buffer.byteLength(responseData, 'utf8');
    }

    return {
      success: true,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      data: responseData,
      duration,
      size
    };
  } catch (err) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      error: err.message || 'Request failed',
      duration,
      size: 0
    };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
