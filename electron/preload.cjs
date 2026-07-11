const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("appStorage", {
  loadCollection(collectionName) {
    return ipcRenderer.invoke("app-storage:load-collection", collectionName);
  },

  saveCollection(collectionName, entities) {
    return ipcRenderer.invoke(
      "app-storage:save-collection",
      collectionName,
      entities,
    );
  },

  clearCollection(collectionName) {
    return ipcRenderer.invoke("app-storage:clear-collection", collectionName);
  },

  getInfo() {
    return ipcRenderer.invoke("app-storage:get-info");
  },
});

window.addEventListener("DOMContentLoaded", () => {
  console.log("Electron preload ready");
});
