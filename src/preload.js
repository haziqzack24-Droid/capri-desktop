'use strict';

/**
 * Android WebView JavaScript Bridge Replacement for Electron contextBridge
 * This maps the desktop RPC calls to Android's window.Android interface (or standard WebSockets/fetch if hosted via a local server).
 */

const createListener = (eventName) => (fn) => {
  // On Android, events from native can be dispatched via custom window events
  const listener = (e) => fn(e.detail);
  window.addEventListener(eventName, listener);
  return () => window.removeEventListener(eventName, listener);
};

// Helper to call native Android interfaces safely
const callNative = (methodName, ...args) => {
  if (window.Android && typeof window.Android[methodName] === 'function') {
    // If Android interface returns a JSON string or promise
    const result = window.Android[methodName](...args);
    try {
      return Promise.resolve(JSON.parse(result));
    } catch {
      return Promise.resolve(result);
    }
  }
  return Promise.reject(new Error(`Android interface method '${methodName}' not found.`));
};

const sendNative = (methodName, ...args) => {
  if (window.Android && typeof window.Android[methodName] === 'function') {
    window.Android[methodName](...args);
  }
};

window.host = {
  // Event listeners (mapped to window CustomEvents dispatched from native Android code)
  onClaudeEvent: createListener('claude:event'),
  onCommand: createListener('capri:command'),
  onConfig: createListener('capri:config'),
  onResize: createListener('overlay:resize'),
  onWindows: createListener('windows:update'),

  // Actions & Commands
  setInteractive: (on) => sendNative('setInteractive', Boolean(on)),
  rearm: () => sendNative('rearm'),
  cursor: () => callNative('cursor'),
  screens: () => callNative('screensList'),
  moveScreen: (id) => callNative('moveScreen', id),
  getConfig: () => callNative('getConfig'),
  setConfig: (patch) => callNative('setConfig', JSON.stringify(patch)),
  listSounds: () => callNative('listSounds'),
  hooksStatus: () => callNative('hooksStatus'),
  demoWindow: (open) => callNative('demoWindow', Boolean(open)),
  openMenu: () => sendNative('openMenu'),
  installHooks: () => callNative('installHooks'),
  claudeFound: () => callNative('claudeFound'),
  openClaudeHelp: () => sendNative('openClaudeHelp'),
  windowsNow: () => callNative('windowsGet'),
  closePage: (id, key) => callNative('closePage', id, key),
  trayPlace: () => callNative('guideTray'),
  openClaudeFolder: () => callNative('guideClaudeFolder'),
  copyImage: (rect) => callNative('copyImage', JSON.stringify(rect)),
  
  // Chat & AI
  chatStatus: () => callNative('chatStatus'),
  chatSend: (request) => callNative('chatSend', JSON.stringify(request)),
  chatStop: (id) => sendNative('chatStop', id),
  chatMemory: () => callNative('chatMemory'),
  chatRemember: (history) => sendNative('chatRemember', JSON.stringify(history)),
  onChatDelta: createListener('chat:delta'),

  // Look & PC Actions (Adapted for Android equivalent services)
  lookSnap: () => callNative('lookSnap'),
  lookSay: (request) => callNative('lookSay', JSON.stringify(request)),
  lookWhere: () => callNative('lookWhere'),
  cpu: () => callNative('cpuInfo'),
  pcDo: (req) => callNative('pcDo', JSON.stringify(req)),
  onPcProgress: createListener('pc:progress'),
  pcIdle: () => callNative('pcIdle'),
  
  // Ollama & Setup
  openOllama: () => sendNative('openOllama'),
  setupInfo: () => callNative('setupInfo'),
  ollamaState: () => callNative('setupOllama'),
  installOllama: () => callNative('installOllama'),
  startOllama: () => callNative('startOllama'),
  pullModel: (name) => callNative('setupPull', name),
  cancelSetup: () => sendNative('setupCancel'),
  useProvider: (choice) => callNative('setupUse', choice),
  keyPage: (provider) => sendNative('setupKeyPage', provider),
  launchThroughOllama: (integration) => callNative('setupLaunch', integration),
  onSetupProgress: createListener('setup:progress'),

  // Apps & System
  openApps: () => callNative('appsList'),
  findApp: (wanted) => callNative('appsFind', wanted),
  closeApp: (name, force) => callNative('appsClose', name, Boolean(force)),
  findLaunch: (text) => callNative('appsFindLaunch', text),
  launch: (item) => callNative('appsLaunch', item),
  media: (action) => callNative('appsMedia', action),
  music: (query) => callNative('appsMusic', query),
  youtube: (query) => callNative('appsYoutube', query),
  roblox: (query) => callNative('appsRoblox', query),
  
  // Files & Web
  searchFiles: (query) => callNative('filesSearch', query),
  openFile: (file, reveal) => callNative('filesOpen', file, Boolean(reveal)),
  screenshot: () => callNative('filesScreenshot'),
  webSearch: (query) => callNative('webSearch', query),
  openSite: (address) => callNative('appsSite', address),
  focusOverlay: (on) => sendNative('overlayFocus', Boolean(on)),
};
