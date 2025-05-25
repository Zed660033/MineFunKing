const { app } = require('electron');

exports.applyFlags = (settingsCache) => {
    if (!['win32', 'darwin'].includes(process.platform)) app.commandLine.appendSwitch('no-sandbox');
    if (settingsCache.inProcessGPU) app.commandLine.appendSwitch('in-process-gpu');

    [
        ['autoplay-policy', 'no-user-gesture-required'],
        ['enable-gpu-rasterization'],
        ['enable-oop-rasterization'],
        ['disable-zero-copy'],
        ['enable-webgl2-compute-context'],
        ['enable-highres-timer'],
        ['enable-high-resolution-time'],
        ['disable-renderer-backgrounding'],
        ['disable-background-timer-throttling'],
        ['enable-javascript-harmony'],
        ['enable-future-v8-vm-features'],
        ['enable-webgl'],
        ['disable-2d-canvas-clip-aa'],
        ['disable-bundled-ppapi-flash'],
        ['disable-logging'],
        ['disable-breakpad'],
        ['disable-print-preview'],
        ['disable-hang-monitor'],
        ['disable-component-update'],
        ['disable-metrics-repo'],
        ['disable-metrics'],
        ['max-active-webgl-contexts', '100'],
        ['webrtc-max-cpu-consumption-percentage', '100'],
        ['renderer-process-limit', '100'],
        ['ignore-gpu-blacklist'],
        ['enable-accelerated-2d-canvas'],
        ['enable-quic'],
        ['enable-native-gpu-memory-buffers'],
        ['high-dpi-support', '1'],
        ['no-pings'],
        ['disable-low-end-device-mode'],
        ['enable-accelerated-video-decode'],
        ['no-proxy-server'],
        ['disable-dev-shm-usage'],
        ['use-angle', 'default'],
    ].forEach(x => app.commandLine.appendSwitch(...x));
};