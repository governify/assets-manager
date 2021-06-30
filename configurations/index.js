'use strict';

const jsyaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const mustache = require('mustache');

/**
 * Configuration module.
 * @module config
 * @requires js-yaml
 * @requires fs
 * @requires winston
 * */

/*
 * Export functions and Objects
 */
const config = {
  addConfiguration: _addConfiguration,
  setProperty: _setProperty
};

module.exports = config;

/*
 * Setup default config location
 */
config.addConfiguration('config.yaml', 'utf8');

config.state = {
  agreementsInProgress: []
};

/** Write info messages on logger. */
module.exports.stream = {
  /** Print an info message on logger.
     * @param {String} message message to print
     * @param {String} encoding message enconding
     * @alias module:config.stream.write
     * */
  write: function (message) {
    module.exports.logger.info(message);
  }
};

/*
 * Implement the functions
 */
function _addConfiguration (uri, encoding) {
  var configStringTemplate = null;
  var configString = null;

  if (!uri) {
    throw new Error('Parameter URI is required');
  } else {
    configStringTemplate = fs.readFileSync(path.join(__dirname, uri), encoding);
  }
  configString = mustache.render(configStringTemplate, process.env);
  var newConfigurations = jsyaml.load(configString)[process.env.NODE_ENV ? process.env.NODE_ENV : 'development'];

  for (var c in newConfigurations) {
    this[c] = newConfigurations[c];
  }
}

function _setProperty (propertyName, newValue) {
  this[propertyName] = newValue;
}
