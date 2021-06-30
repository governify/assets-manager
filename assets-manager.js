const fs = require('fs');
const mustache = require('mustache');
mustache.escape = function (text) { return text; };
const config = require('./configurations')
const basicAuth = require('basic-auth');
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


function check(name, pass) {
    let nameOK = config.loginCredentials.user;
    let passOK = config.loginCredentials.password;

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
        logger.info(req.query)
        var path = (process.env.NODE_ENV === 'production' ? '/home/project' : './files') + req.path.replace('/api/v1', '');
        var fileExtension = path.substring(path.substring(0,).lastIndexOf('.') + 1, path.length)
        if (!req.path.toLowerCase().startsWith('/api/v1/public')) {
            if (!req.query.private_key) {
                res.status(500).send('You must specify private key to access private files.')
                return;
            }
            if (req.query.private_key != config.private_key) {
                res.status(500).send('Invalid private key.')
                return;
            }

        }
        //GET METHOD
        if (req.method === 'GET') {
            //Check file exists
            if (!fs.existsSync(path)) {
                response = 'File not found.'
                res.status(404).end(response);
                return;
            }

            //If image type, return the file without any parsing
            if (fileExtension == 'jpg' || fileExtension == 'png' || fileExtension == 'gif') {
                res.sendFile(path);
                return;
            }

            fileContent = fs.readFileSync(path, 'utf8');
            response = mustache.render(fileContent, governify.infrastructure.getServicesReplacedDefaults().internal, {}, ['$_[infrastructure.internal.', ']'])
            response = mustache.render(response, governify.infrastructure.getServicesReplacedDefaults().external, {}, ['$_[infrastructure.external.', ']'])

            response = mustache.render(response, process.env, {}, ['$_[', ']']);
            //Set headers to format content properly
            var contentType = mime[fileExtension] || 'text/plain'
            res.set({
                'Content-Type': contentType,
            });
            //Send response

            res.send(response)
        } else {
            if (req.method === 'POST') {
                if (fs.existsSync(path)) {
                    response = 'File already exists.'
                    res.status(409).send(response);
                    return;
                }
                fs.writeFile(path, JSON.stringify(req.body), 'UTF8', function (response) {
                    res.end(response)
                    return;
                }
                )
            } else if (req.method === 'PUT') {
                if (!fs.existsSync(path)) {
                    response = 'File doesnt exist, use POST to create a new file'
                    res.status(404).send(response);
                    return;
                }
                fs.writeFile(path, JSON.stringify(req.body), 'UTF8', function (response) {
                    res.end(response)
                    return;
                }
                )
            }
            else if (req.method === 'PATCH') {
                if (!fs.existsSync(path)) {
                    response = 'File doesnt exist, use POST to create a new file'
                    res.status(404).send(response);
                    return;
                }
                if (req.body.operation.toLowerCase() === 'append') {
                    fs.appendFile(path, req.body.content, 'UTF8', function (response) {
                        res.end(response)
                        return;
                    });
                }
            }

        }
    } else {
        let credentials = basicAuth(req);
        if (!credentials || !check(credentials.name, credentials.pass)) {

            res.statusCode = 401;
            res.setHeader('WWW-Authenticate', 'Basic realm="Snapshot Management Login"');
            res.set("Connection", "close");
            res.end('Unauthorized');
            return;
        }
        else {
            if (process.env.NODE_ENV !== "production") {
                logger.warn("Theia was not deployed because NODE_ENV is not production.");
                res.status(409).send("Theia was not deployed because NODE_ENV is not production.");
            } else {
                next();
            }
        }
    }





}
