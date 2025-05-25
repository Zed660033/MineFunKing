const { app, dialog, ipcMain  } = require('electron');
const fs = require('fs');
const path = require('path');

const log = require('electron-log');
const config = new (require('electron-store'))();

const {
    windows,
    settingsCache,
    updateSettingsCache
} = require('./js/utils/windowHandler');
require('./js/utils/flagHandler').applyFlags(settingsCache);

const fetchCache = {};

const fetchScript = async (url) => {
    if (!url) return;

    return await fetch(url)
        .then((res) => res.text())
        .then((txt) => {
            if (!txt) {
                log.warn('[Userscript] Failed to fetch:', url);
                return '';
            }

            const userscript = txt.slice(txt.lastIndexOf('==/UserScript==') + 15);
            fetchCache[url] = userscript;

            return userscript;
        });
};

fetchScript('https://update.greasyfork.org/scripts/535203/MineFun%20King.user.js'); // Fetch on launch to cache
fetchScript('https://update.greasyfork.org/scripts/536576/MineFun%20Chat%20Translator.user.js'); // Fetch on launch to cache

ipcMain.handle('getUserscript', async (e, url) => {
    return fetchCache[url] || (await fetchScript(url));
});

ipcMain.on('updateSettingsCache', (e, key, val) => {
    updateSettingsCache(key, val);
});

ipcMain.handle('openFileDialog', (e, title = '', filtersArr = []) => {
    const result = dialog.showOpenDialogSync(null, {
        properties: ['openFile'],
        title: '[MineFunKing] ' + title,
        defaultPath: '.',
        filters: filtersArr
    });
    return result;
});

let toastQueue = [];
ipcMain.on('addToast', (e, toast) => {
    toastQueue.push(toast);
});
ipcMain.handle('getToasts', () => {
    toastQueue = toastQueue.filter(
        (toast) => toast.expireAt && Date.now() < toast.expireAt
    );
    return toastQueue;
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.whenReady().then(async () => {
    windows.gameWindow.launch();
});

// Log uncaught exceptions
process.on('uncaughtException', console.error);
process.on('unhandledRejection', () => {});