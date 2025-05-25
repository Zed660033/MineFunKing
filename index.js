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
const fetchScript = async (key, url) => {
    if (!url) return;

    return await fetch(url)
        .then((res) => res.text())
        .then((txt) => {
            if (!txt) {
                log.warn('[Userscript] Failed to fetch:', url);
                return '';
            }

            const userscript = txt.slice(txt.lastIndexOf('==/UserScript==') + 15);
            fetchCache[key] = userscript;

            return userscript;
        });
};

fetchScript('cheat', 'https://update.greasyfork.org/scripts/535203/MineFun%20King.user.js');
fetchScript('autoTranslate', 'https://update.greasyfork.org/scripts/536576/MineFun%20Chat%20Translator.user.js');

ipcMain.on('updateSettingsCache', (e, key, val) => {
    updateSettingsCache(key, val);
});

ipcMain.handle('getUserscript', (e, key) => {
    return fetchCache[key];
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