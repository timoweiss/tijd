const { globalShortcut } = require('electron')

const OPEN = 'CmdOrCtrl+Shift+U'

module.exports = {
  onOpen(fn) {
    return globalShortcut.register(OPEN, fn)
  }
}