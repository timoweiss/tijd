const req = require('request');
const { version: currentVersion } = require('../package.json');

const getLatestDownloadPath = function() {
    const options = {
        url: 'https://api.github.com/repositories/101575843/releases',
        headers: { 'User-Agent': 'michaelknoch' }
    };

    req(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const { assets } = JSON.parse(body)[0];
            const latestRelease = assets.filter(
                asset => asset.content_type == 'application/zip'
            )[0];

            return latestRelease.browser_download_url;
        }
    });
}

module.exports = {
    getLatestDownloadPath
};
