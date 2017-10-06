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
 * author Dave Bryson, Joe Portner
 *
 */

'use strict';

var
    brahma = require('../../lib/brahma'),
    toDate = require('to-date');
    brahma.logger = require('../../lib/logger');

var
    exec = require('exec'),
    child_process = require('child_process'),
    script_folder_path = '/opt/BRAHMA/';

var request = require('request');
// CREATE
// POST /services/vm-session
// body {username: '', expireAt: '', connectTime: ''}
// Response 200 {msg: msg}
// 400 missing parameter(s)
// 500 other errors
exports.createSession  = function(req,res){
    if (!req.body.username || !req.body.expireAt || !req.body.connectTime) {
        res.json(400, {msg: 'Missing parameter(s)'});
        return;
    }

    var conditions = {
        'username': req.body.username
    };
    var update = {
        'username': req.body.username,
        'expireAt': req.body.expireAt,
        'lastAction': new Date(0), // This sets to 1969
        'connectTime': req.body.connectTime // the time this connection was first established
    };
    var options = {
        'upsert': true
    };

    try {
        // if a VM session already exists for this user, overwrite it
        brahma.VMSession.findOneAndUpdate(conditions, update, options, function (err, sess) {
            if (err) {
                res.json(500, {msg:'Error creating the session' });
            } else {

                // Support User status update 
                var update_status = {
                        'Status': 'Connected'
                };
                var username = req.body.username;
                brahma.User.update({username: username}, update_status, function (err, numberAffected, raw) {
                    if (err) {
                        brahma.logger.error("Mongoose: Update user session status issue: " + req.body.username);
                    }
                });


/*
                new brahma.ConcurrentSession({
                    username: req.body.username
                }).save(function (err,u,num) {
                    if (err) {
                        //res.json(500, {msg: 'Error adding user: ' + err.message});
                        brahma.logger.error("Mongoose:  Add concurrent session issue: " + req.body.username);
                    }
                });
*/

/*
var text = req.body.username + " login from " + req.ip;
var dateTime = require('node-datetime');
var dt = dateTime.create();
var formatted = dt.format('Y-m-d H:M:S');
                new brahma.UserSession({
                    content: text,
                    lastAction: formatted
                }).save(function (err,u,num) {
                    if (err) {
                        //res.json(500, {msg: 'Error adding user: ' + err.message});
                        brahma.logger.error("Mongoose:  Add user session issue: " + req.body.username);
                    }
                });
*/
                res.json(200, {msg:'Created session successfully'});
            }
        });

    } catch (err) {
        res.json(500, {msg:'Error creating the session' });
    }
};

// UPDATE
// PUT /services/vm-session
// body {username: '', lastAction: '', connectTime: ''}
// Response 200 {msg: msg}
// 400 missing parameter(s)
// 500 other errors
exports.updateSession = function (req, res) {
    if (!req.body.username || !req.body.lastAction || !req.body.connectTime) {
        res.json(400, {msg: 'Missing parameter(s)'});
        return;
    }

    var query = {
        'username': req.body.username,
        // requiring connectTime makes sure we don't update this VMSession after the user reconnected
        // (for instance, if a user connects with a second device while the first one is connected)
        'connectTime': req.body.connectTime
    };
    var update = {
        'lastAction': req.body.lastAction
    };

    try {
        brahma.VMSession.update(query, update, function (err) {
            if (err) {
                res.json(500, {msg:'Error updating the session'});
            } else {

                // Support User status update 
                var update_status = {
                        'Status': 'Idle',
                        'latency': ''
                };
                var username = req.body.username;
                brahma.User.update({username: username}, update_status, function (err, numberAffected, raw) {
                    if (err) {
                        brahma.logger.error("Mongoose: Update user session status issue: " + req.body.username);
                    }
                });

/*
                brahma.ConcurrentSession.findOne({username: req.body.username}, function (err, session) {
                    if (err) {
                        brahma.logger.error("Error finding "+ req.body.username+" concurrent session. " + err.message);
                    } else {
                        session.remove();
                    }
                });
*/

var text = req.body.username + " logout!";
var dateTime = require('node-datetime');
var dt = dateTime.create();
var formatted = dt.format('Y-m-d H:M:S');

var addLogUrl = brahma.config.get('rest_server_url')+ "/log/addAppClientLog";

            var appLog_data = {
                "username": req.body.username,
                "ipAddress": req.body.ip,
                "message": text
            }

            request.post(
                addLogUrl,
                {json:appLog_data},
                function(){
                    console.log("signout");
                }
            );

                brahma.UserSession({
                    content: text,
		    lastAction: formatted
                }).save(function (err,u,num) {
                    if (err) {
                        //res.json(500, {msg: 'Error adding user: ' + err.message});
                        brahma.logger.error("Mongoose:  Add user session issue on logout: " + req.body.username);
                    }
                });

                child_process.exec(script_folder_path+"restartSvmp.sh " + req.body.username ,function(stderr,stdout,err){
                      if (err) {
                         res.json(500, {msg: 'Error updateing user'});
                      }
                });

                res.json(200, {msg:'Updated session successfully'});
            }
        });
    } catch (err) {
        res.json(500, {msg:'Error updating the session'});
    }
};

