import '@/lib/electron/main';
import * as path from 'path';
import { app, BrowserWindow, Menu, MenuItem } from 'electron';
import { bridge } from '@/lib/electron/ModuleBridge';

//TEMP
const i18n = {
    t<T>(s: T) {
        return s;
    },
};

app.disableHardwareAcceleration();

function createMenu(): Menu {
    const menu = new Menu();

    menu.append(
        new MenuItem({
            label: i18n.t('Dev'),
            submenu: [
                {
                    label: i18n.t('Toggle Developer Tools'),
                    accelerator: 'ctrl+shift+i',
                    click: () => {
                        BrowserWindow.getFocusedWindow()!.webContents
                            .toggleDevTools();
                    },
                },
                {
                    label: i18n.t('Reload'),
                    accelerator: 'f5',
                    click: () => {
                        BrowserWindow.getFocusedWindow()!.reload();
                    },
                },
                {
                    label: i18n.t('Exit'),
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
    const width = 1600;
    const height = 900;
    const mainWindow = new BrowserWindow({
        width: width,
        height: height,
        minWidth: width,
        minHeight: height,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
        frame: false,
    });

    if (process.env.DEV == 'true') {
        mainWindow.loadURL('http://127.0.0.1:3000');
    } else {
        mainWindow.loadFile(path.join(__dirname, 'index.html'));
    }

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    return mainWindow;
}

app.whenReady().then(async () => {
    Menu.setApplicationMenu(createMenu());
    createWindow();
});

// nativeTheme.themeSource = "light";
