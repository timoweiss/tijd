// eslint-disable-next-line
const electron = require('electron');
// Module to control application life.

// Module to create native browser window.

const path = require('path');
const url = require('url');
const fs = require('fs');

const shortcuts = require('./shortcuts');

const { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain } = electron;

let NODE_ENV = process.env.NODE_ENV;

// default is prod
if (!NODE_ENV) {
  NODE_ENV = 'prod';
}

const isProd = NODE_ENV === 'prod';

const envConfig = {
  dev: {
    width: 1330,
    height: 800,
    resizable: true,
    movable: true,
    url: 'http://localhost:3000',
    dataPath: path.join(__dirname, '..', 'logs.jsonl'),
  },
  prodlike: {
    width: 330,
    height: 400,
    resizable: true,
    movable: true,
    url: 'http://localhost:3000',
    dataPath: path.join(__dirname, '..', 'logs.jsonl'),
  },
  prod: {
    width: 330,
    height: 400,
    resizable: false,
    movable: false,
    url: url.format({
      pathname: path.join(__dirname, '..', 'renderer', 'build', 'index.html'),
      protocol: 'file:',
      slashes: true,
    }),
    dataPath: path.join((electron.app || electron.remote.app).getPath('userData'), 'logs.jsonl'),
  },

};

const config = envConfig[NODE_ENV];

const logFile = config.dataPath;
try {
  console.log({ logFile });
  fs.openSync(logFile, 'a');
} catch (e) {
  console.log('error calling openSync');
}

const trayIconPath = path.join(__dirname, '../img/if_stop-watch-time-count_2203547.png');


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

ipcMain.on('new-entry', (event, arg) => {
  fs.appendFile(logFile, `${JSON.stringify(arg)}\n`, (err) => {
    if (err) throw err;
    console.log('Saved!');
  });
});

const dataCache = {
  lastFetched: 0,
  data: null,
};

function loadData(callback = () => { }) {
  if (dataCache.lastFetched < Date.now() - (1000 * 10)) {
    fs.readFile(logFile, 'utf-8', (err, data) => {
      if (err) throw err;
      const jsonArray = data.split('\n');
      console.log({ jsonArray });
      const parsedData = jsonArray
        .filter(jsonString => !!jsonString)
        .map(jsonString => JSON.parse(jsonString));
      dataCache.lastFetched = Date.now();
      dataCache.data = parsedData;
      callback(parsedData);
    });
  } else {
    console.log('serving from cache');
    callback(dataCache.data);
  }
}
loadData();
ipcMain.on('get-entries', event => loadData(data => event.sender.send('get-entries-resp', data)));

ipcMain.on('hide-app', () => mainWindow.hide());

const updateWindowPosition = (trayBounds, window) => {
  const { screen } = electron;
  const { workArea } = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  const windowSize = window.getSize();

  const trayCenter = trayBounds.x + (trayBounds.width / 2);
  const horizontalPosition = trayCenter - (windowSize[0] / 2);
  const verticalPosition = workArea.y + 5;
  window.setPosition(horizontalPosition, verticalPosition);
};

const createBrowserWindow = (tray) => {
  mainWindow = new BrowserWindow(Object.assign(config, {
    title: 'Tijd',
    show: false,
    fullscreenable: false,

    maximizable: false,
    minimizable: false,
    transparent: true,
    frame: false,
    webPreferences: {
      backgroundThrottling: false,
      devTools: !isProd,
    },
  }));

  updateWindowPosition(tray.getBounds(), mainWindow);

  mainWindow.loadURL(config.url);
  mainWindow.on('blur', () => mainWindow.hide());

  // don't know why, but this seems to fix the initial shadow problem
  setTimeout(() => console.log('showing') || mainWindow.show(), 1000);
};

const toggleApp = (tray, window) => {
  if (!window) {
    createBrowserWindow(tray);
    return;
  }
  if (window.isVisible()) {
    window.hide();
  } else {
    updateWindowPosition(tray.getBounds(), window);
    window.show();
  }
};


function toggleOpenAtLogin() {
  app.setLoginItemSettings({
    openAtLogin: !app.getLoginItemSettings().openAtLogin,
  });
}


function createWindow() {
  // Create the browser window.

  const tray = new Tray(trayIconPath);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Launch at login', type: 'checkbox', click: () => toggleOpenAtLogin(), checked: app.getLoginItemSettings().openAtLogin },
    { type: 'separator' },
    { label: 'Quit', type: 'normal', click: () => app.quit() },
  ]);

  tray.setToolTip('Track your time!');


  tray.on('right-click', () => {
    console.log('right-click');
    tray.popUpContextMenu(contextMenu);
  });

  tray.on('click', () => toggleApp(tray, mainWindow));

  toggleApp(tray, mainWindow);
  if (!shortcuts.onOpen(() => toggleApp(tray, mainWindow))) {
    console.error('registering shortcut failed');
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

app.on('will-quit', () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
