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
const fetchScript = async (key, filePath) => {
    if (!filePath) return;

    try {
        const isLocalFile = 
            (process.platform === 'win32' && /^[a-zA-Z]:\\/.test(filePath)) || 
            !filePath.startsWith('http://') && !filePath.startsWith('https://');
            
        if (isLocalFile) {
            const txt = fs.readFileSync(filePath, 'utf-8');
            const userscript = txt.slice(txt.lastIndexOf('==/UserScript==') + 15);
            fetchCache[key] = userscript;
            log.info(`[Userscript] Successfully loaded local script: ${key}`);
            return userscript;
        } else {
            return await fetch(filePath)
                .then((res) => res.text())
                .then((txt) => {
                    if (!txt) {
                        log.warn('[Userscript] Failed to fetch:', filePath);
                        return '';
                    }

                    const userscript = txt.slice(txt.lastIndexOf('==/UserScript==') + 15);
                    fetchCache[key] = userscript;

                    return userscript;
                });
        }
    } catch (error) {
        log.error(`[Userscript] Failed to load script ${key}:`, error);
        log.error(`[Userscript] Path attempted: ${filePath}`);
        return '';
    }
};

// Load script from local
const cheatScriptPath = path.join(__dirname, 'js', 'userscripts', 'MineFunKing.user.js');
const translatorScriptPath = path.join(__dirname, 'js', 'userscripts', 'MineFunChatTranslator.user.js');

fetchScript('cheat', cheatScriptPath);
fetchScript('autoTranslate', translatorScriptPath);

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