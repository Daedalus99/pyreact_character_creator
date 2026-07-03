const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
  // Removes the default File/Edit/View/etc menu.
  Menu.setApplicationMenu(null);

  const win = new BrowserWindow({
    width: 900,
    height: 700,

    // Minimum resize size
    minWidth: 800,
    minHeight: 500,

    // Hides the menu bar on Windows/Linux.
    // Pressing Alt may still reveal it unless the app menu is removed.
    autoHideMenuBar: true,

    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
    },
  });

  win.loadURL('http://127.0.0.1:5173');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});