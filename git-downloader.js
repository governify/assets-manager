
var spawn = require('child_process').spawn;
const logger = require('governify-commons').getLogger().tag('git-downloader');

function gitDownload (url, path, branch) {
  return new Promise((resolve, reject) => {
    var args = ['clone'];
    args.push(url);
    args.push(path);

    if (branch) {
      args.push('-b');
      args.push(branch);
    }

    var process = spawn('git', args);
    process.stderr.on('data', function (data) {
      logger.info('GIT-CLONE-CONSOLE: ' + data);
    });
    process.on('close', function (status) {
      if (status === 0) {
        resolve('Cloned succesfully');
      } else {
        resolve('git clone failed with status ' + status);
      }
    });
  });
}

module.exports.gitDownload = gitDownload;
