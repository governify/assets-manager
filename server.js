// @ts-check
require('reflect-metadata');

// Patch electron version if missing, see https://github.com/eclipse-theia/theia/pull/7361#pullrequestreview-377065146
if (typeof process.versions.electron === 'undefined' && typeof process.env.THEIA_ELECTRON_VERSION === 'string') {
    process.versions.electron = process.env.THEIA_ELECTRON_VERSION;
}

const path = require('path');
const express = require('express');
const { Container } = require('inversify');
const { BackendApplication, CliManager } = require('@theia/core/lib/node');
const { backendApplicationModule } = require('@theia/core/lib/node/backend-application-module');
const { messagingBackendModule } = require('@theia/core/lib/node/messaging/messaging-backend-module');
const { loggerBackendModule } = require('@theia/core/lib/node/logger-backend-module');
const assetsManager = require('./assets-manager');
const config = require('./configurations');
const gitDownloader = require('./git-downloader')
const bodyParser = require('body-parser');

//Setting the default infrastructure location
if (!process.env['GOV_INFRASTRUCTURE']) {
    process.env['GOV_INFRASTRUCTURE'] = '/home/project/public/infrastructure.yaml'
}



const container = new Container();
container.load(backendApplicationModule);
container.load(messagingBackendModule);
container.load(loggerBackendModule);

function load(raw) {
    return Promise.resolve(raw.default).then(module =>
        container.load(module)
    )
}

function start(port, host, argv) {
    if (argv === undefined) {
        argv = process.argv;
    }
    const cliManager = container.get(CliManager);
    return cliManager.initializeCli(argv).then(async function () {
        const application = container.get(BackendApplication);
        //application.use(cors());
        if (process.env['ASSETS_REPOSITORY']) { // Download assets from repository if specified in ENV VAR
            console.log('Assets repository URL specified. Downloading assets from: ', process.env['ASSETS_REPOSITORY'])
            if (process.env['ASSETS_REPOSITORY_BRANCH']) {
                console.log('And checking out branch:', process.env['ASSETS_REPOSITORY_BRANCH'])
            }
            await gitDownloader.gitDownload(process.env['ASSETS_REPOSITORY'], '/home/project', process.env['ASSETS_REPOSITORY_BRANCH'], process.env['ASSETS_REPOSITORY_SSHKEY']);
            console.log('Git download process finished');
        }

        const governify = require('governify-commons');
        await governify.init().then(govMiddleware => {
            application.use('/commons', govMiddleware);
            application.use(assetsManager.serveMiddleware);

        }).catch(err => {
            console.error('Error in governify commons: ', err)
        });
        application.use(express.static(path.join(__dirname, '../../lib')));
        application.use(express.static(path.join(__dirname, '../../lib/index.html')));

        return application.start(config.port, host);
    });
}

module.exports = (port, host, argv) => Promise.resolve()
    //Add governify module load

    .then(function () { return Promise.resolve(require('@theia/filesystem/lib/node/filesystem-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@theia/filesystem/lib/node/download/file-download-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@theia/workspace/lib/node/workspace-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@theia/process/lib/common/process-common-module')).then(load) })
    .then(function () { return Promise.resolve(require('@theia/process/lib/node/process-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@theia/terminal/lib/node/terminal-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@theia/task/lib/node/task-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@theia/debug/lib/node/debug-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@theia/file-search/lib/node/file-search-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@theia/git/lib/node/git-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@theia/git/lib/node/env/git-env-module')).then(load) })
    .then(function () { return Promise.resolve(require('@theia/mini-browser/lib/node/mini-browser-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@theia/search-in-workspace/lib/node/search-in-workspace-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@theia/plugin-ext/lib/plugin-ext-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@theia/plugin-ext-vscode/lib/node/plugin-vscode-backend-module')).then(load) })
    .then(function () { return Promise.resolve(require('@theia/vsx-registry/lib/node/vsx-registry-backend-module')).then(load) })
    .then(() => start(config.port, host, argv)).catch(reason => {
        console.error('Failed to start the backend application.');
        if (reason) {
            console.error(reason);
        }
        throw reason;
    });
