const { autoUpdater } = require('electron'); // eslint-disable-line
const req = require('request');
const semver = require('semver');
const { version: currentVersion } = require('../package.json');

function getLatestDownloadPath() {
  const options = {
    url: 'https://api.github.com/repositories/101575843/releases',
    headers: { 'User-Agent': 'michaelknoch' },
  };

  return new Promise(((resolve, reject) => {
    req(options, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const { assets, tag_name } = JSON.parse(body)[0];
        const latestZip = assets.find(asset => asset.content_type === 'application/zip');

        /* eslint-disable no-console */
        console.log('currently on', currentVersion);
        console.log('found version', semver.clean(tag_name));
        /* eslint-enable no-console */

        if (semver.lt(currentVersion, semver.clean(tag_name))) {
          resolve(latestZip.browser_download_url);
        }
        reject(`you are up to date with ${currentVersion}`);
      }
      reject('error during update', error);
    });
  }));
}

function checkForUpdates() {
  getLatestDownloadPath()
    .then((feedUrl) => {
      autoUpdater.setFeedURL(feedUrl);
      autoUpdater.checkForUpdates();
    })
    .catch(e => console.log(e));

  autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall();
  });
}

module.exports = { checkForUpdates };
