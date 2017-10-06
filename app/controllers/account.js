/*
 * Copyright 2014 The MITRE Corporation, All Rights Reserved.
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
 * author Dave Bryson
 *
 */

'use strict';

var
    brahma = require('../../lib/brahma'),
    auth = require('../../lib/authentication'),
    strategy = auth.loadStrategy(),
    toDate = require('to-date'),
    uuid = require('node-uuid'),
    util = require('util');
    brahma.logger = require('../../lib/logger');

var request = require('request');

var logger = require('winston');
var webLog = require('./log');
/**
 * Login/Authenticate User.
 *
 * Loads authentication strategy based on config file settings (TLS, PAM, DB)
 * and checks if password change is needed.
 *
 * On Success, returns a JSON payload with a JWT token that the client must send
 * as a header field in subsequent requests to get access.
 * @param req
 * @param res
 */


exports.login = function(req,res) {
logger.info("login api start");
//brahma.logger.silly("[DEBUG] Start Login on account module");
    // use loaded strategy for authentication
    res.logUsername = req.body.username;

    // check to see if this user account is currently locked
//    var error = brahma.lockout.checkForLock(req.body.username);
//    if (error) {
//        res.logMessage = error;
//        res.json(401,{msg: error});
//        return;
//    }

//brahma.logger.silly("[DEBUG] res username = "+ res.logUsername);
    strategy(req,function(errCode,result) {
        var addLogUrl = brahma.config.get('rest_server_url')+ "/log/addAppClientLog";

//brahma.logger.silly("[DEBUG] errorCode = "+ errCode);
//brahma.logger.silly("[DEBUG] req = "+ req.toString());
        if(errCode) {

        if(typeof(req.body.text) != "undefined" && req.body.text !== null){

        }else{
        var appLog_data = {
           "username": req.body.username,
           "ipAddress": req.connection.remoteAddress,
           "message": "Invalid login credentials"
        }
        request.post(
                   addLogUrl,
                   {json:appLog_data},
                   function(){}
                );
        }

            res.logMessage = 'Invalid login credentials';
            res.json(errCode,{msg: 'Error authenticating'});
       // callback(errCode);
            // report a failed login attempt
            //brahma.lockout.failedAttempt(req.body.username);
        } else {
        if(typeof(req.body.text) != "undefined" && req.body.text !== null){
            var webLog_data = {
                   "user": req.session.username,
                   "roles": req.session.roles,
                   "action": "signin",
                   "ipAddress": req.connection.remoteAddress.replace(/(^\D*)/g,""),
                   "message": req.session.username + " signin success"
                }

                webLog.addWebPortalLog(webLog_data);
        }else{

            var appLog_data = {
                   "username": req.body.username,
                   "ipAddress": req.connection.remoteAddress,
                   "message": req.body.username + " login successful"
            }

                request.post(
                   addLogUrl,
                   {json:appLog_data},
                   function(){}
                );
        }

            res.logMessage = 'Login successful';
            sendToken(res, result);
        }
    });
};


/**
 * Change current User password
 * @param req
 * @param res
 */
exports.changeUserPassword = function(req,res) {
    var un = req.body.username;
    var oldPassword = req.body.password;
    var newPassword = req.body.newPassword;

    res.logUsername = un;
    if (!un || !oldPassword || !newPassword) {
        res.logMessage = 'Missing required fields';
        res.json(400, {msg: 'Missing required field(s)'});
    } else {
        brahma.User.findOne({username: un}, function (err, user) {
            if (err) {
                res.logMessage = 'Internal error';
                res.json(500, {msg: 'Internal error'});
            }
            else if (user && user.authenticate(oldPassword)) {

                user.password = newPassword;
                user.password_change_needed = false;

                user.save(function (err1, r) {
                    if (err1) {
                        // user model validation failed
                        res.logMessage = 'Failed validation';
                        res.json(400, {msg: 'Failed validation'});
                    } else {
                        res.logMessage = 'Password change successful';
                        sendToken(res, {'user': user});
                    }
                });
            }
            else {
                // failed authentication, reject
                res.logMessage = 'Error authenticating';
                res.json(401, {msg: 'Error authenticating'}); // UnAuth
            }
        });
    }

};

// private function
function sendToken(res, result) {
    // Setup token
    // result either contains an existing token, or a user object

    var max_session;
    var token = result.token;
    if (token) {
        // the client used a JWT to log in; instruct them to reuse it
        // we tell the client the number of seconds the token is valid; this has decreased
        max_session = (new Date(result.exp).getTime() - new Date().getTime()) / 1000;
    } else {
        // the client authenticated some other way; make a new token
        max_session = brahma.config.get('max_session_length');
        var args = {
            'sub': result.user.username,
            'role': result.user.roles[0],
            'exp': Math.floor(toDate(max_session).seconds.fromNow / 1000),
            //'iss': brahma.config.get('rest_server_url'),
            'jti': uuid.v4()
        };
        token = auth.makeToken(args);
    }

    // Response object
    var responseObj = {
        sessionInfo: {
            token: token,
            role: result.user.roles,
            maxLength: max_session
        },
        server: {
            host: brahma.config.get('proxy_host'),
            port: brahma.config.get('proxy_port')
        },
        webrtc: brahma.config.get("webrtc")
    };

    res.json(200,responseObj);
}

