const electron = require('electron')
// Module to control application life.

// Module to create native browser window.
const { app, BrowserWindow, Tray, Menu, globalShortcut } = electron;

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
  // Create the browser window.

  const tray = new Tray(path.join(__dirname, '../img/if_stop-watch-time-count_2203547.png'))
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Quit', type: 'normal', click: () => app.quit() },

  ])

  tray.setToolTip('This is my application.')


  tray.on('right-click', () => {
    console.log('right-click')
    tray.popUpContextMenu(contextMenu)
  })

  const createBrowserWindow = () => {
    const trayBounds = tray.getBounds();
    console.log({ trayBounds })

    mainWindow = new BrowserWindow({
      width: 330,
      height: 400,
      title: 'Now',
      resizable: false,
      show: true,
      fullscreenable: false,

      maximizable: false,
      minimizable: false,
      transparent: true,
      frame: false,
      movable: false,
      y: 10,
      x: trayBounds.x - 160,
      webPreferences: {
        backgroundThrottling: false,
        devTools: true
      }
    })


    const prod = url.format({
      pathname: path.join(__dirname, '..', 'renderer', 'build', 'index.html'),
      protocol: 'file:',
      slashes: true
    });
    const dev = 'http://localhost:3000';
    console.log(process.env.NODE_ENV === 'dev' ? dev : prod)
    mainWindow.loadURL(process.env.NODE_ENV === 'dev' ? dev : prod);
    mainWindow.on('blur', () => mainWindow.hide())

  };


  const openWindow = () => {
    console.log('click')
    if (!mainWindow) {
      createBrowserWindow();
    }

    mainWindow.show();
  };
  createBrowserWindow();


  tray.on('click', openWindow)
  const ret = globalShortcut.register('CmdOrCtrl+Shift+U', () => {
    console.log('CmdOrCtrl+Shift+U is pressed', { mainWindow })
    if (!mainWindow || !mainWindow.isFocused()) {
      openWindow();
    } else {
      mainWindow.hide()
    }

  })

  if (!ret) {
    console.log('registration failed')
  }

  tray.on('drop-text', () => {
    console.log('drop-text')
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    }))
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

app.on('will-quit', () => {

  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
