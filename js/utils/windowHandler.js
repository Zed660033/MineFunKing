const fs = require('fs');
const { BrowserWindow, shell, clipboard, app } = require('electron');
const path = require('path');
const localShortcut = require('electron-localshortcut');
const log = require('electron-log');
const config = new (require('electron-store'))();

const settingsCache = config.get(
    'settings',
    require('./settingsCacheTemplate')
);

const updateSettingsCache = (key, val) => {
    settingsCache[key] = val;
    if (windows.gameWindow.win?.webContents)
        windows.gameWindow.win.webContents.send(
            'settingsCacheUpdated',
            settingsCache,
            key,
            val
        );
    if (windows.settingsWindow.win?.webContents)
        windows.settingsWindow.win.webContents.send(
            'settingsCacheUpdated',
            settingsCache,
            key,
            val
        );
};

const windows = {
    gameWindow: {
        win: null,
        launch: function () {
            if (this.win) this.win.close();
            this.win = new GameWindow();
        }
    },
    settingsWindow: {
        win: null,
        launch: function () {
            if (this.win) this.win.close();
            this.win = new SettingsWindow();
        }
    }
};

class GameWindow {
    constructor() {
        const win = new BrowserWindow({
            width: config.get('window.width', 1500),
            height: config.get('window.height', 1000),
            x: config.get('window.x'),
            y: config.get('window.y'),
            show: false,
            title: '[MineFunKing] MineFun.io',
            webPreferences: {
                contextIsolation: false,
                preload: path.join(__dirname, '../preload/game.js'),
                devTools: true,
                sandbox: false
            }
        });

        win.removeMenu();
        win.setBackgroundColor('#2f2f2f');

        if (config.get('window.maximized', false)) win.maximize();
        if (config.get('window.fullscreen', false)) win.setFullScreen(true);

        win.once('ready-to-show', () => {
            win.show();
        });
        win.on('page-title-updated', (e) => {
            e.preventDefault();
        });
        win.webContents.on('new-window', (e, url) => {
            e.preventDefault();
            if (String(url).startsWith('https://')) shell.openExternal(url);
        });

        [
            [
                'F3',
                () => {
                    clipboard.writeText(win.webContents.getURL());
                }
            ],
            [
                'F4',
                () => {
                    let txt = clipboard.readText();
                    if (!txt) return;
                    let hostname;
                    try {
                        hostname = new URL(txt).hostname;
                    } catch {
                        hostname = '';
                    }
                    if (hostname === 'minefun.io') {
                        log.info(`[Join Hotkey] Attempting to join '${txt}'`);
                        win.loadURL(txt);
                    } else {
                        txt =
                            'https://minefun.io/' + txt.startsWith('#')
                                ? txt
                                : '#' + txt;
                        log.info(`[Join Hotkey] Attempting to join '${txt}'`);
                        win.loadURL(txt);
                    }
                }
            ],
            [
                'F5',
                () => {
                    win.reload();
                }
            ],
            [
                'F6',
                () => {
                    win.loadURL('https://minefun.io');
                }
            ],
            [
                'F8',
                () => {
                    if (!windows.settingsWindow.win?.focus)
                        windows.settingsWindow.win = new SettingsWindow();
                    windows.settingsWindow.win.focus();
                }
            ],
            [
                'F11',
                () => {
                    const isFullScreen = win.isFullScreen();
                    config.set('window.fullscreen', !isFullScreen);
                    win.setFullScreen(!isFullScreen);
                }
            ],
            [
                ['CommandOrControl+F1', 'F12', 'CommandOrControl+Shift+I'],
                () => {
                    win.webContents.openDevTools({ mode: 'detach' });
                }
            ]
        ].forEach((k) => {
            try {
                localShortcut.register(win, k[0], k[1]);
            } catch (e) {
                log.info('[LocalShortcut] ERROR:', e);
            }
        });

        win.webContents.session.clearCache().then(() => {
            win.loadURL('https://minefun.io/');
        });

        win.on('close', () => {
            if (
                windows.settingsWindow.win &&
                windows.settingsWindow.win?.close !== undefined
            )
                windows.settingsWindow.win.close();

            const isMaximized = win.isMaximized();
            const isFullScreen = win.isFullScreen();
            const windowSize = win.getSize();
            const windowPosition = win.getPosition();

            config.set('window.maximized', isMaximized);
            config.set('window.fullscreen', isFullScreen);
            if (!(isMaximized || isFullScreen)) {
                config.set('window.width', windowSize[0]);
                config.set('window.height', windowSize[1]);
                config.set('window.x', windowPosition[0]);
                config.set('window.y', windowPosition[1]);
            }

            windows.settingsWindow.win = null;
        });

        return win;
    }
}

class SettingsWindow {
    constructor() {
        const win = new BrowserWindow({
            width: 400,
            height: 346,
            fullscreen: false,
            maximizable: false,
            resizable: false,
            alwaysOnTop: true,
            show: false,
            title: '[MineFunKing] Settings',
            webPreferences: {
                contextIsolation: false,
                preload: path.join(__dirname, '../preload/settings.js'),
                devTools: false,
                sandbox: false
            }
        });

        win.removeMenu();
        win.setBackgroundColor('#2f2f2f');

        win.once('ready-to-show', () => {
            win.show();
        });
        win.on('page-title-updated', (e) => {
            e.preventDefault();
        });

        win.loadURL(path.join(__dirname, '../../html/settings.html'));

        win.on('close', () => {
            const windowPosition = win.getPosition();
            config.set('window2.x', windowPosition[0]);
            config.set('window2.y', windowPosition[1]);
            windows.settingsWindow.win = null;
        });

        return win;
    }
}

exports.windows = windows;
exports.settingsCache = settingsCache;
exports.updateSettingsCache = updateSettingsCache;
