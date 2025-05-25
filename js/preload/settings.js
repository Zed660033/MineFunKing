const { ipcRenderer } = require('electron');
const log = require('electron-log');
const config = new (require('electron-store'))();

const settingsCache = config.get('settings', require('../utils/settingsCacheTemplate'));

ipcRenderer.on('settingsCacheUpdated', (e, newSettingsCache) => {
    Object.assign(settingsCache, newSettingsCache);
});

const setCheckboxControl = (key) => document.getElementById(key).checked = settingsCache[key];

let allowOFD = true;
window.openFileDialog = (key) => {
    if (!allowOFD) return;
    allowOFD = false;

    ipcRenderer.invoke('openFileDialog', `${(key === 'crosshairPath') ? 'Crosshair' : 'Background'} Image Picker`, [{ name: 'Image', extensions: ['jpg', 'png', 'webp', 'gif'] }])
        .then(val => {
            if (!val) {
                log.info(`[Settings] No File Selected, kept old value for 'settings.${key}'`);
                return;
            }

            config.set(`settings.${key}`, val);
            ipcRenderer.send('updateSettingsCache', key, val);
            log.info(`[Settings] Set 'settings.${key}' to '${val}'`);
        })
        .catch(err => {
            log.info('[Settings] Error:', err);
        })
        .finally(() => {
            allowOFD = true;
        })
};

window.handleSwitch = (element) => {
    config.set(`settings.${element.id}`, element.checked);
    ipcRenderer.send('updateSettingsCache', element.id, element.checked);

};

document.addEventListener('DOMContentLoaded', () => {
    setCheckboxControl('inProcessGPU');
    setCheckboxControl('blockAds');
    setCheckboxControl('enableCheats');
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' || event.keyCode === 27) {
        document.exitPointerLock();
    }
});