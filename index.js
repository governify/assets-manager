const assetsManager = require('./assets-manager');
const governify = require('governify-commons');
const logger = governify.getLogger().tag("index");
const express = require('express');
const http = require('http');
const app = express();

const SERVER_PORT = 5200;
const main = async () => {
    await governify.init().then(govMiddleware => {
        app.use(express.json());
        app.use(express.text());
        app.use(govMiddleware);
        app.use(assetsManager.serveMiddleware);
        http.createServer(app).listen(SERVER_PORT, function () {
            logger.info("Server running in port", SERVER_PORT);
        });
    }).catch(err => {
        logger.error('Error in governify commons: ', err)
    });
}

// quit on ctrl-c when running docker in terminal
process.on('SIGINT', function onSigint() {
    logger.info('Got SIGINT (aka ctrl-c in docker). Graceful shutdown ', new Date().toISOString());
    process.exit();
});

// quit properly on docker stop
process.on('SIGTERM', function onSigterm() {
    logger.info('Got SIGTERM (docker container stop). Graceful shutdown ', new Date().toISOString());
    process.exit();
});

main();

const undeploy = () => {
    process.exit();
  };
  
module.exports = {
    deploy: main,
    undeploy: undeploy
};
  