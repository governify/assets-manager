const fs = require('fs');
const mustache = require('mustache');
mustache.escape = function (text) { return text; };
const config = require('./configurations')
const basicAuth = require('basic-auth');
const cors = require('cors');


module.exports.serveMiddleware = serveMiddleware;

var mime = {
    html: 'text/html',
    txt: 'text/plain',
    css: 'text/css',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    js: 'application/javascript'
};


function check(name, pass) {
    let nameOK = config.login_credentials.user;
    let passOK = config.login_credentials.password;

    let valid = true;
    valid = name === nameOK && valid;
    valid = pass === passOK && valid;
    return valid;
}


function serveMiddleware(req, res, next) {
    //Authentication for theia

    //File serving api
    if (req.path.startsWith("/api/v1")) {
        var response;
        var fileContent;
        console.log(req.query)
        var path = __dirname + '/files' + req.path.replace('/api/v1', '');
        var fileExtension = path.substring(path.substring(0,).lastIndexOf('.') + 1, path.length)
        if (!req.path.toLowerCase().startsWith('/api/v1/public')) {
            if (!req.query.private_key) {
                res.send(500, 'You must specify private key to access private files.')
                return;
            }
            if (req.query.private_key != config.private_key) {
                res.send(500, 'Invalid private key.')
                return;
            }

        }
        //Check file exists
        if (!fs.existsSync(path)) {
            response = 'File not found.'
            res.end(response);
            return;
        }
       
        //If image type, return the file without any parsing
        if (fileExtension == 'jpg' || fileExtension == 'png' || fileExtension == 'gif') {
            res.sendFile(path);
            return;
        }

        fileContent = fs.readFileSync(path, 'utf8');
        response = mustache.render(fileContent, process.env, {}, ['$_[', ']']);
        //Set headers to format content properly
        var contentType = mime[fileExtension] || 'text/plain'
        res.set({
            'Content-Type': contentType,
        });
        //Send response
     
        res.send(response)
    }
    else {
        let credentials = basicAuth(req);
        if (!credentials || !check(credentials.name, credentials.pass)) {

            res.statusCode = 401;
            res.setHeader('WWW-Authenticate', 'Basic realm="Snapshot Management Login"');
            res.set("Connection", "close");
            res.end('Unauthorized');
            return;
        }
        else {
            next();
        }
    }





}