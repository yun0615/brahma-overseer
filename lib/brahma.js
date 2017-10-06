/*
 * Copyright 2013-2014 The MITRE Corporation, All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this work except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author Dave Bryson
 */

/**
 * Main namespace object used through-out the app.
 *
 * @exports brahma
 */
var brahma = {};

module.exports = brahma;

/**
 * Current version used. Read from package.json
 * @type {String}
 */
//brahma.VERSION = require('../package.json').version;

/**
 * Called at start of App.  Initializes the core modules
 */
brahma.init = function() {

    /**** Setup ****/

    // Winston and wrap in out global name space
    brahma.logger = require('./logger');
    brahma.logger.beforeConfig();


    // Config with validation
    brahma.config = require('./config');
    brahma.config.init();

    brahma.logger.afterConfig();

    var cloud = brahma.config.get('cloud_platform');
    if (cloud === "openstack") {
        brahma.cloud = require('./cloud/openstack');
    } else if (cloud === "aws") {
        brahma.cloud = require('./cloud/aws');
    }
    brahma.cloud.init();

    // Mongoose with Q wrapper
    brahma.mongoose = require('mongoose-q')(require('mongoose'));

    if(!brahma.mongoose.connection.db) {
        var dbname;

        if(process.env.NODE_ENV === 'production') {
            dbname = brahma.config.get('db:production');
        } else {
             dbname = brahma.config.get('db:test');
           }
        brahma.mongoose.connect(dbname);
        brahma.logger.info("Mongoose:  connected to: " + dbname);

        brahma.mongoose.connection.on('error',function (err) {
            brahma.logger.error("Problem connecting to mongdb. Is it running? " + err );
            process.exit(1);
        });
        brahma.mongoose.connection.on('disconnected', function () {
            brahma.logger.info("Mongoose:  disconnected connection");
        });

    }
    // Model
    brahma.User = require('./model/user')(brahma.mongoose);
    brahma.VMSession = require('./model/vm-session')(brahma.mongoose);
    brahma.ConcurrentSession = require('./model/concurrentSession')(brahma.mongoose);
    brahma.UserSession = require('./model/user-session')(brahma.mongoose);
    brahma.webLog = require('./model/webLog')(brahma.mongoose);
    brahma.appClientLog = require('./model/appClientLog')(brahma.mongoose);


    brahma.confAuth = require('./model/confAuth')(brahma.mongoose);


    // used to lock out users who fail authentication too many times
    brahma.lockout = require('./lockout');
};

/**
 * Shut down. Closes DB connection and cleans up any temp config settings
 */
brahma.shutdown = function() {
    brahma.config.reset();

    if(brahma.mongoose.connection){
        brahma.mongoose.connection.close();
    }
}
