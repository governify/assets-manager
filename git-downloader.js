
var spawnSync = require('child_process').spawnSync;
const fs = require('fs');
const logger = require('governify-commons').getLogger().tag('git-downloader');

function gitDownload (url, path, branch) {
  return new Promise((resolve, reject) => {
    var args = ['clone'];
    var empty = fs.readdirSync(path).length === 0;

    args.push(url);
    args.push(empty ? path : `${path}/tmp`);

    if (branch) {
      args.push('-b');
      args.push(branch);
    }

    var process = spawnSync('git', args);
    if (process.stderr) {
      logger.info(`GIT-CLONE-CONSOLE: ${process.stderr.toString()}`);
      resolve('Failed to clone')
    }
    
    if (!empty) {
      logger.info(`GIT-CLONE-CONSOLE: Directory not empty, attempting to merge with current files`);

      fs.renameSync(`${path}/tmp/.git`, `${path}/.git`); // Moves .git folder
      fs.rmdirSync(`${path}/tmp`, { recursive: true });

      var reset = spawnSync('git', ['reset', '--hard', 'HEAD'], { cwd: path });
      if (reset.stderr) {
        logger.info(`GIT-CLONE-CONSOLE: ${process.stderr.toString()}`);
        resolve('Failed to reset')
      }
    } 
    resolve('Cloned succesfully'); 
  });
}

module.exports.gitDownload = gitDownload;
