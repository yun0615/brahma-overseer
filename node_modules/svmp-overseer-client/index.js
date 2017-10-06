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
 * author Joe Portner
 *
 */

'use strict';

var
    agent = require('superagent'),
    urlhelper = require('url');

/**
 * All calls require a callback function in the form:
 * function(error, result){}
 * The first parameter is obviously any errors.
 * The second param is a response object.  It contains the usual
 * statuscode, body. etc...
 */


/**
 * Create an API client
 * @param baseurl. ex: http://localhost:3000
 * @param token. The svmp token. The app requires a token with admin privileges
 * @constructor
 */
var Overseer = function (baseurl, token) {
    this.baseurl = baseurl;
    this.token = token;
};

module.exports = Overseer;

// Internal function to clean-up the URL
Overseer.prototype._makeUrl = function (href, param) {
    var u = urlhelper.resolve(this.baseurl, href);
    if (param) {
        return u + '/' + param;
    } else {
        return u;
    }
};

/**
 * List all Users
 * @param callback function(err, results)
 */
Overseer.prototype.listUsers = function (callback) {
    var url = this._makeUrl('/services/users');
    agent.get(url)
        .set('svmp-authtoken', this.token)
        .end(callback);
};

/**
 * Create a new user
 * @param un. Username
 * @param passwd. User password
 * @param email.  Email address
 * @param device. Device type
 * @param callback function(err, result)
 */
Overseer.prototype.createUser = function (un, passwd, email, device, callback) {
    var url = this._makeUrl('/services/user');
    agent.post(url)
        .set('svmp-authtoken', this.token)
        .send({user: {
            username: un,
            password: passwd,
            email: email,
            device_type: device
        }})
        .end(callback);

};

/**
 * Delete a User
 * @param username to delete
 * @param callback  function(err, result)
 */
Overseer.prototype.deleteUser = function (username, callback) {
    var url = this._makeUrl('/services/user', username);
    agent.del(url)
        .set('svmp-authtoken', this.token)
        .end(callback);

};

/**
 * Get a user
 * @param username of user
 * @param callback function(err,result)
 */
Overseer.prototype.getUser = function (username, callback) {
    var url = this._makeUrl('/services/user', username);
    agent.get(url)
        .set('svmp-authtoken', this.token)
        .end(callback);
};

/**
 * Update a User
 * @param username of user
 * @param data Object with fields to update, ex:  {email: 'change@here.com', device_type: 'nexus'}
 * @param callback function(err, result)
 */
Overseer.prototype.updateUser = function (username, data, callback) {
    var url = this._makeUrl('/services/user', username);
    agent.put(url)
        .set('svmp-authtoken', this.token)
        .send({update: data})
        .end(callback);
};

/**
 * List supported devices from config file
 * @param callback
 */
Overseer.prototype.listDevices = function (callback) {
    var url = this._makeUrl('/services/cloud/devices');
    agent.get(url)
        .set('svmp-authtoken', this.token)
        .end(callback);
};

/**
 * List Volumes
 * @param callback
 */
Overseer.prototype.listVolumes = function (callback) {
    var url = this._makeUrl('/services/cloud/volumes');
    agent.get(url)
        .set('svmp-authtoken', this.token)
        .end(callback);
};

/**
 * Assign an existing VM Volume(s) to a User
 * @param username
 * @param volid
 * @param callback
 */
Overseer.prototype.assignVolume = function (username, volid, callback) {
    var url = this._makeUrl('/services/cloud/assignvolume');
    agent.post(url)
        .set('svmp-authtoken', this.token)
        .send({username: username, volid: volid})
        .end(callback);
};

/**
 * List all VM Image(s)
 * @param callback
 */
Overseer.prototype.listImages = function (callback) {
    var url = this._makeUrl('/services/cloud/images');
    agent.get(url)
        .set('svmp-authtoken', this.token)
        .end(callback);
};

/**
 * Create a VM Volume for a user
 * @param username
 * @param callback
 */
Overseer.prototype.createVolume = function (username, callback) {
    var url = this._makeUrl('/services/cloud/volume/create');
    agent.post(url)
        .set('svmp-authtoken', this.token)
        .send({username: username})
        .end(callback);
};

/**
 * Create and start a VM for a User
 * @param username
 * @param callback
 */
Overseer.prototype.setupVM = function (username, callback) {
    var url = this._makeUrl('/services/cloud/setupVm', username);
    agent.get(url)
        .set('svmp-authtoken', this.token)
        .end(callback);
};

/**
 * Create a VM Session for a user
 * @param username of user
 * @param connectTime, Date the user opened this connection
 * @param expireAt, Date the VM Session expires
 * @param callback
 */
Overseer.prototype.createVMSession = function (username, connectTime, expireAt, callback) {
    var url = this._makeUrl('/services/vm-session');
    agent.post(url)
        .set('svmp-authtoken', this.token)
        .send({username: username, connectTime: connectTime, expireAt: expireAt})
        .end(callback);
};

/**
 * Update a VM Session for a user
 * @param username of user
 * @param connectTime, Date the user opened this connection
 * @param lastAction, Date the user disconnected
 * @param callback
 */
Overseer.prototype.updateVMSession = function (username, connectTime, lastAction, callback) {
    var url = this._makeUrl('/services/vm-session');
    agent.put(url)
        .set('svmp-authtoken', this.token)
        .send({username: username, connectTime: connectTime, lastAction: lastAction})
        .end(callback);
};
