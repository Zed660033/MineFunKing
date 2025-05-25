const { ipcRenderer } = require('electron');
const log = require('electron-log');
const config = new (require('electron-store'))();

const settingsCache = config.get('settings', require('../utils/settingsCacheTemplate'));

ipcRenderer.on('settingsCacheUpdated', (e, newSettingsCache) => {
    Object.assign(settingsCache, newSettingsCache);
});

const setCheckboxControl = (key) => document.getElementById(key).checked = settingsCache[key];

window.handleSwitch = (element) => {
    config.set(`settings.${element.id}`, element.checked);
    ipcRenderer.send('updateSettingsCache', element.id, element.checked);
};

document.addEventListener('DOMContentLoaded', () => {
    [...document.querySelectorAll('input[type="checkbox"]')].forEach(x => {
        setCheckboxControl(x.id);
    });
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' || event.keyCode === 27) {
        document.exitPointerLock();
    }
});