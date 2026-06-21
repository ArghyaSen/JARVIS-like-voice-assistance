const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow;
let pythonProcess;

const BACKEND_URL = "http://127.0.0.1:8000";
const PYTHON_ENTRY = path.join(__dirname, "../backend/main.py");


// --- Start Python backend as a child process ---
async function startPythonBackend() {
  // Check if backend is already running before spawning
  const http = require("http");
  const alreadyRunning = await new Promise((resolve) => {
    http.get(BACKEND_URL, () => resolve(true)).on("error", () => resolve(false));
  });

  if (alreadyRunning) {
    console.log("[Electron] Backend already running, skipping spawn.");
    return;
  }

  console.log("[Electron] Starting Python backend...");

  pythonProcess = spawn("python", [PYTHON_ENTRY], {
    cwd: path.join(__dirname, "../backend"),
    stdio: "pipe",
  });

  pythonProcess.stdout.on("data", (data) => {
    console.log(`[Python] ${data.toString().trim()}`);
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`[Python ERR] ${data.toString().trim()}`);
  });

  pythonProcess.on("close", (code) => {
    console.log(`[Python] Process exited with code ${code}`);
  });
}


// --- Wait until backend is ready before loading UI ---
async function waitForBackend(retries = 20, delay = 500) {
  const http = require("http");

  for (let i = 0; i < retries; i++) {
    try {
      await new Promise((resolve, reject) => {
        http.get(BACKEND_URL, resolve).on("error", reject);
      });
      console.log("[Electron] Backend is ready.");
      return true;
    } catch {
      console.log(`[Electron] Waiting for backend... (${i + 1}/${retries})`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  return false;
}


// --- Create the main app window ---
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 520,
    height: 700,
    minWidth: 520,
    resizable: false,
    frame: false,
    transparent: true,
    alwaysOnTop: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Uncomment to open DevTools for debugging
  // mainWindow.webContents.openDevTools();
}


// --- App lifecycle ---
app.whenReady().then(async () => {
  await new Promise((r) => setTimeout(r, 2000));

  await startPythonBackend();

  const ready = await waitForBackend();
  if (!ready) {
    console.error("[Electron] Backend failed to start. Exiting.");
    app.quit();
    return;
  }

  createWindow();

  // Press Ctrl+Shift+J to trigger voice listen
  globalShortcut.register("CommandOrControl+Shift+J", () => {
    if (mainWindow) {
      mainWindow.webContents.send("trigger-listen");
    }
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  // Kill Python backend when app closes
  if (pythonProcess) {
    pythonProcess.kill();
    console.log("[Electron] Python backend stopped.");
  }
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});


// Send a text message to Jarvis
ipcMain.handle("chat", async (_, message) => {
  const res = await fetch(`${BACKEND_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return await res.json();
});

// Trigger microphone listening
ipcMain.handle("listen", async () => {
  const res = await fetch(`${BACKEND_URL}/listen`, { method: "POST" });
  return await res.json();
});

// Clear conversation history
ipcMain.handle("clear-history", async () => {
  const res = await fetch(`${BACKEND_URL}/history`, { method: "DELETE" });
  return await res.json();
});

// Window controls (since we have no native frame)
ipcMain.on("minimize-window", () => mainWindow.minimize());
ipcMain.on("close-window", () => {
  if (pythonProcess) pythonProcess.kill();
  app.quit();
});