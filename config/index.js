'use strict';
var path = require('path'),
    fs = require('fs'),
    config = require('./_base'),
    _debug = require('debug');

const debug = _debug('app:config');
debug('Create configuration.');
debug(`Apply environment overrides for NODE_ENV "${config.env}".`);
const overridesFilename = `_${config.env}`;
let hasOverridesFile;
try {
    fs.lstatSync(`${__dirname}/${overridesFilename}.js`);
    hasOverridesFile = true;
} catch (e) {
    debug(e.message);
}
let overrides;
if (hasOverridesFile) {
    overrides = require(`./${overridesFilename}`);
} else {
    debug(`No configuration overrides found for NODE_ENV "${config.env}"`);
}

module.exports = Object.assign({}, config, overrides);
