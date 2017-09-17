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


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

ipcMain.on('new-entry', (event, arg) => {
  fs.appendFile(logFile, `${JSON.stringify(arg)}\n`, (err) => {
    if (err) throw err;
    console.log('Saved!');
  });
});

ipcMain.on('get-entries', (event) => {
  fs.readFile(logFile, 'utf-8', (err, data) => {
    if (err) throw err;
    const jsonArray = data.split('\n');
    console.log({ jsonArray });
    const parsedData = jsonArray
      .filter(jsonString => !!jsonString)
      .map(jsonString => JSON.parse(jsonString));
    event.sender.send('get-entries-resp', parsedData);
  });
});

ipcMain.on('hide-app', () => mainWindow.hide());

function createWindow() {
  // Create the browser window.

  const tray = new Tray(path.join(__dirname, '../img/if_stop-watch-time-count_2203547.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Quit', type: 'normal', click: () => app.quit() },

  ]);

  tray.setToolTip('This is my application.');


  tray.on('right-click', () => {
    console.log('right-click');
    tray.popUpContextMenu(contextMenu);
  });

  const createBrowserWindow = () => {
    const trayBounds = tray.getBounds();
    console.log({ trayBounds });

    mainWindow = new BrowserWindow(Object.assign(config, {
      title: 'Tijd',
      show: true,
      fullscreenable: false,

      maximizable: false,
      minimizable: false,
      transparent: true,
      frame: false,
      y: 25,
      x: trayBounds.x - 154,
      webPreferences: {
        backgroundThrottling: false,
        devTools: !isProd,
      },
    }));


    mainWindow.loadURL(config.url);
    mainWindow.on('blur', () => mainWindow.hide());
  };


  const toggleApp = () => {
    if (!mainWindow) {
      createBrowserWindow();
    }
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  };
  createBrowserWindow();

  tray.on('click', toggleApp);


  if (!shortcuts.onOpen(toggleApp)) {
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
