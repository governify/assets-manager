const assetsManager = require('../assets-manager');
const governify = require('governify-commons');
const express = require('express');
const http = require('http');

const app = express();

const main = async () => {
    await governify.init().then(govMiddleware => {
        app.use(govMiddleware);
        app.use(assetsManager.serveMiddleware);
        http.createServer(app).listen(11111, function () {
            console.log("running!");
          });
    }).catch(err => {
        logger.error('Error in governify commons: ', err)
    });
}

main();