const fs = require('fs');
const mustache = require('mustache');
mustache.escape = function (text) { return text; };
const config = require('./configurations');
const basicAuth = require('basic-auth');
const path = require('path');
const governify = require('governify-commons');
const logger = governify.getLogger().tag('assets-manager');

module.exports.serveMiddleware = serveMiddleware;

var mime = {
  html: 'text/html',
  txt: 'text/plain',
  css: 'text/css',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  js: 'application/javascript',
  json: 'application/json'
};

function check (name, pass) {
  const nameOK = config.loginCredentials.user;
  const passOK = config.loginCredentials.password;

  let valid = true;
  valid = name === nameOK && valid;
  valid = pass === passOK && valid;
  return valid;
}

function serveMiddleware (req, res, next) {
  // Authentication for theia

  // File serving api
  if (req.path.startsWith('/api/v1')) {
    var response;
    var fileContent;
    logger.info(req.query);
    var reqPath = req.path.replace('/api/v1', '');

    var filePath;
    var tmpPath;

    if (req.path.toLowerCase().startsWith('/api/v1/private') || req.path.toLowerCase().startsWith('/api/v1/info/private')) {
      if (!req.query.private_key) {
        res.status(500).send('You must specify private key to access private files.');
        return;
      }
      if (req.query.private_key !== config.private_key) {
        res.status(500).send('Invalid private key.');
      }
    } else if (req.path.toLowerCase().startsWith('/api/v1/info/')) {
      reqPath = reqPath.replace('/info', '');

      tmpPath = process.env.NODE_ENV === 'production' ? '/home/project' : path.join(__dirname, 'files');
      filePath = path.join(tmpPath, reqPath);

      if (req.method === 'GET') {
        var fileStats = fs.lstatSync(filePath);
        response = {
          name: filePath.substring(filePath.substring(0).lastIndexOf('/') + 1, filePath.length),
          dir: fileStats.isDirectory(),
          lastModified: fileStats.mtime
        };

        if (fileStats.isDirectory()) {
          var files = [];

          fs.readdirSync(filePath).forEach(v => {
            var stats = fs.lstatSync(filePath + '/' + v);
            var file = {
              name: v,
              lastModified: stats.mtime,
              dir: stats.isDirectory()
            };
            files.push(file);
          });

          response.files = files;
          response.fileCount = files.length;
        }

        res.send(response);
      }
    } else if (!reqPath.toLowerCase().startsWith('/info')) {
      tmpPath = process.env.NODE_ENV === 'production' ? '/home/project' : path.join(__dirname, 'files');
      filePath = path.join(tmpPath, reqPath);

      var fileExtension = filePath.substring(filePath.substring(0).lastIndexOf('.') + 1, filePath.length);

      // GET METHOD
      if (req.method === 'GET') {
        // Check file exists

        if (!fs.existsSync(filePath)) {
          response = 'File not found.';
          res.status(404).end(response);
          return;
        }

        // If image type, return the file without any parsing
        if (fileExtension === 'jpg' || fileExtension === 'png' || fileExtension === 'gif') {
          res.sendFile(filePath);
          return;
        }

        // If zip type, download the file
        if (fileExtension === 'zip') {
          const file = filePath.split('/').pop();
          res.download(filePath, file, function (err) {
            if (err) {
              console.log('download', err);
            }
          });
          return;
        }

        fileContent = fs.readFileSync(filePath, 'utf8');
        response = mustache.render(fileContent, governify.infrastructure.getServicesReplacedDefaults().internal, {}, ['$_[infrastructure.internal.', ']']);
        response = mustache.render(response, governify.infrastructure.getServicesReplacedDefaults().external, {}, ['$_[infrastructure.external.', ']']);

        response = mustache.render(response, process.env, {}, ['$_[', ']']);
        // Set headers to format content properly
        var contentType = mime[fileExtension] || 'text/plain';
        res.set({
          'Content-Type': contentType
        });
        // Send response

        res.send(response);
      } else {
        if (req.method === 'POST') {
          if (req.files) {
            var file = Object.values(req.files)[0];
            if (fs.existsSync(filePath + '/' + file.name)) {
              response = 'File already exists.';
              res.end(response);
              return;
            }

            file.mv(filePath + '/' + file.name, function (err) {
              if (err) { return res.status(500).send(err); }

              res.send('File uploaded');
            });
            return;
          }
          if (fs.existsSync(filePath)) {
            response = 'File already exists.';
            res.end(response);
            return;
          }
          fs.writeFile(filePath, JSON.stringify(req.body), 'UTF8', function (response) {
            res.end(response);
          }
          );
        } else if (req.method === 'PUT') {
          if (!fs.existsSync(filePath)) {
            response = 'File doesnt exist, use POST to create a new file';
            res.end(response);
            return;
          }
          fs.writeFile(filePath, JSON.stringify(req.body), 'UTF8', function (response) {
            res.end(response);
          }
          );
        } else if (req.method === 'PATCH') {
          if (!fs.existsSync(filePath)) {
            response = 'File doesnt exist, use POST to create a new file';
            res.end(response);
            return;
          }
          if (req.body.operation.toLowerCase() === 'append') {
            fs.appendFile(filePath, req.body.content, 'UTF8', function (response) {
              res.end(response);
            });
          }
        }
      }
    }
  } else {
    const credentials = basicAuth(req);
    if (!credentials || !check(credentials.name, credentials.pass)) {
      res.statusCode = 401;
      res.setHeader('WWW-Authenticate', 'Basic realm="Snapshot Management Login"');
      res.set('Connection', 'close');
      res.end('Unauthorized');
    } else {
      if (process.env.NODE_ENV !== 'production') {
        logger.warn('Theia was not deployed because NODE_ENV is not production.');
        res.status(409).send('Theia was not deployed because NODE_ENV is not production.');
      } else {
        next();
      }
    }
  }
}
