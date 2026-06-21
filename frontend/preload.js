const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("jarvis", {

  // Send a typed message to Jarvis and get a reply
  chat: (message) => ipcRenderer.invoke("chat", message),

  // Trigger microphone listening
  listen: () => ipcRenderer.invoke("listen"),

  // Clear conversation history
  clearHistory: () => ipcRenderer.invoke("clear-history"),

  // Window controls
  minimize: () => ipcRenderer.send("minimize-window"),
  close: () => ipcRenderer.send("close-window"),

  // Listen for the global hotkey trigger from main.js
  onTriggerListen: (callback) => {
    ipcRenderer.on("trigger-listen", callback);
  },

  // Clean up the hotkey listener when done
  removeTriggerListen: (callback) => {
    ipcRenderer.removeListener("trigger-listen", callback);
  },

});