import * as path from "path";
import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  MenuItem,
  nativeTheme,
  session,
} from "electron";

//TEMP
const i18n = {
  t<T>(s: T) {
    return s;
  },
};

function createMenu(): Menu {
  const menu = new Menu();

  menu.append(
    new MenuItem({
      label: i18n.t("Dev"),
      submenu: [
        {
          label: i18n.t("Toggle Developer Tools"),
          accelerator: "ctrl+shift+i",
          click: () => {
            BrowserWindow.getFocusedWindow()!.webContents.toggleDevTools();
          },
        },
        {
          label: i18n.t("Reload"),
          accelerator: "f5",
          click: () => {
            BrowserWindow.getFocusedWindow()!.reload();
          },
        },
        {
          label: i18n.t("Exit"),
          // accelerator: "esc",
          click: () => {
            app.quit();
          },
        },
      ],
    }),
  );

  return menu;
}

function createWindow() {
  // Create the browser window.
  const width = 1300;
  const height = 700;
  const mainWindow = new BrowserWindow({
    width: width,
    height: height,
    minWidth: width,
    minHeight: height,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    frame: false,
  });

  if (process.env.DEV == "true") {
    mainWindow.loadURL("http://127.0.0.1:3000");
  } else {
    mainWindow.loadFile(path.join(__dirname, "index.html"));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  return mainWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.whenReady().then(async () => {
  Menu.setApplicationMenu(createMenu());
  createWindow();

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          `default-src 'self' ${process.env.DEV ? "'unsafe-inline'" : ""}`,
        ],
      },
    });
  });
});

// nativeTheme.themeSource = "light";

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("close", () => {
  app.quit();
});

ipcMain.handle("maximize", () => {
  const win = BrowserWindow.getFocusedWindow();

  if (win?.isMaximized()) {
    win?.unmaximize();
  } else {
    win?.maximize();
  }
});

ipcMain.handle("is-maximized", (e) => {
  return BrowserWindow.getFocusedWindow()?.isMaximized();
});

ipcMain.handle("minimize", () => {
  BrowserWindow.getFocusedWindow()?.minimize();
});
