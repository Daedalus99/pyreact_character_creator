const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("node:path");
const {
  loadCollection,
  saveCollection,
  clearCollection,
  getStorageInfo,
} = require("./storage.cjs");

function registerStorageHandlers() {
  ipcMain.handle(
    "app-storage:load-collection",
    async (_event, collectionName) => {
      return loadCollection(collectionName);
    },
  );

  ipcMain.handle(
    "app-storage:save-collection",
    async (_event, collectionName, entities) => {
      return saveCollection(collectionName, entities);
    },
  );

  ipcMain.handle(
    "app-storage:clear-collection",
    async (_event, collectionName) => {
      return clearCollection(collectionName);
    },
  );

  ipcMain.handle("app-storage:get-info", async () => {
    return getStorageInfo();
  });
}

function createWindow() {
  Menu.setApplicationMenu(null);

  const win = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 800,
    minHeight: 500,
    autoHideMenuBar: true,
    titleBarStyle: "hidden",
    ...(process.platform !== "darwin"
      ? {
          titleBarOverlay: {
            color: "#111827",
            symbolColor: "#f8fafc",
            height: 36,
            borderColor: "#1f2937",
          },
        }
      : {}),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
    },
  });

  win.loadURL("http://127.0.0.1:5173");
  if (!app.isPackaged) {
    win.webContents.openDevTools({ mode: "detach" });
  }
}

app.whenReady().then(() => {
  registerStorageHandlers();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
