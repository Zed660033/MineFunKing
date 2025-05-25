const { ipcRenderer, webFrame } = require('electron');
const config = new (require('electron-store'))();
const mfkLog = (...a) =>
    console.log(
        '%cMineFunKing',
        'font-size:12px;font-weight:bold;color:white;background-color:blue;border-radius:4px;padding:2px 6px;',
        ...a
    );

window.openDiscord = () => true;
window.openRepo = () => true;

const settingsCache = config.get(
    'settings',
    require('../utils/settingsCacheTemplate')
);

ipcRenderer.on('settingsCacheUpdated', (e, newSettingsCache, key, val) => {
    Object.assign(settingsCache, newSettingsCache);
    mfkLog('settingsCache Updated:', key, val);
});

const fetchAndExecuteScript = async (key) => {
    ipcRenderer.invoke('getUserscript', key).then(cheat => {
        if (cheat) webFrame.executeJavaScript(cheat);
    }).catch(err => {
        console.error('[webFrame.executeJavaScript] Error:', err);
    });
};

if (settingsCache.enableCheats) fetchAndExecuteScript('cheat');
if (settingsCache.autoTranslate) fetchAndExecuteScript('autoTranslate');

document.addEventListener('keydown', (event) => {
    if (event?.key === 'Escape' || event?.keyCode === 27) {
        document.exitPointerLock();
    }
});
