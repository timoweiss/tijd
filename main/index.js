// eslint-disable-next-line
const electron = require('electron');
// Module to control application life.

// Module to create native browser window.
const { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain } = electron;

const path = require('path');
const url = require('url');
const fs = require('fs');

// default is prod
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'prod';
}

const isProd = process.env.NODE_ENV === 'prod';

const logFile = isProd ? path.join((electron.app || electron.remote.app).getPath('userData'), 'logs.jsonl') : path.join(__dirname, '..', 'logs.jsonl');
try {
  console.log({ logFile });
  fs.openSync(logFile, 'a');
} catch (e) {
  console.log('error calling openSync');
}


const shortcuts = require('./shortcuts');

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
  console.log('getting entries');
  fs.readFile(logFile, 'utf-8', (err, data) => {
    if (err) throw err;
    const jsonArray = data.split('\n');
    console.log({ jsonArray });
    const a = jsonArray
      .filter(jsonString => !!jsonString)
      .map(jsonString => JSON.parse(jsonString));
    event.sender.send('get-entries-resp', a);
  });
});

ipcMain.on('hide-app', () => {
  mainWindow.hide();
});

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

    mainWindow = new BrowserWindow({
      width: isProd ? 330 : 1330,
      height: isProd ? 400 : 800,
      title: 'Tijd',
      resizable: !isProd,
      show: true,
      fullscreenable: false,

      maximizable: false,
      minimizable: false,
      transparent: true,
      frame: false,
      movable: !isProd,
      y: 25,
      x: trayBounds.x - 154,
      webPreferences: {
        backgroundThrottling: false,
        devTools: !isProd,
      },
    });


    const prod = url.format({
      pathname: path.join(__dirname, '..', 'renderer', 'build', 'index.html'),
      protocol: 'file:',
      slashes: true,
    });
    const dev = 'http://localhost:3000';
    console.log(process.env.NODE_ENV === 'dev' ? dev : prod);
    mainWindow.loadURL(process.env.NODE_ENV === 'dev' ? dev : prod);
    mainWindow.on('blur', () => mainWindow.hide());
  };


  const toggleApp = () => {
    console.log('click');
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
