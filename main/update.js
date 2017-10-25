const GhReleases = require('electron-gh-releases');
const { version: currentVersion } = require('../package.json');

const updater = new GhReleases({
  repo: 'timoweiss/tijd',
  currentVersion,
});

function checkForUpdates() {
  updater.check((err, status) => {
    if (!err && status) {
      updater.download();
    }
  });

  updater.on('update-downloaded', () => {
    updater.install();
  });
}

module.exports = { checkForUpdates };
