/*
 * index.js: Top-level include for the OpenStack module.
 *
 * (C) 2013 Nodejitsu Inc.
 *
 */

exports.blockstorage = require('../rackspace/blockstorage');
exports.compute = require('./compute');
exports.storage = require('./storage');
exports.identity = require('./identity');
