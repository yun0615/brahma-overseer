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
 * author Dave Bryson
 *
 */

'use strict';

var
    brahma = require('../../lib/brahma'),
    Q = require('q'),
    filtered_fields = '_id username email password_change_needed approved device_type volume_id vm_ip vm_ip_id vm_id roles Status latency bandwidth';

// GET /services/users
exports.listUsers = function (req, res) {
    brahma.User.find({})
    .select(filtered_fields)
    .exec(function (err, users) {
        if (err) {
            res.json(500, {msg: 'Error finding users: ' + err.message});
        } else if (!users) {
            res.json(404, {msg: 'Users not found'});
        } else {
            res.json(200, {users: users});
        }
    });
};

// GET /services/user/:username
exports.getUser = function (req, res) {
    var username = req.params.username;
    if (!username) {
        res.json(400, {msg: 'Bad request'});
    } else {
        brahma.User.findOne({username: username}, filtered_fields, function (err, user) {
            if (err) {
                res.json(500, {msg: 'Error finding user: ' + err.message});
            } else if (!user) {
                res.json(404, {msg: 'User not found'});
            } else {
                res.json(200, {user: user});
            }
        });
    }
};

// POST /services/user
exports.addUser = function (req, res) {
    var user = req.body.user;
    var devices = brahma.config.get("new_vm_defaults:images");
    if (!user.device_type || user.device_type.length == 0 || !devices.hasOwnProperty(user.device_type)) {
        res.json(400, {msg: 'Invalid device type specified'});
    } else if (!user || !user.username || !user.password || !user.email) {
        res.json(400, {msg: 'Missing required fields'});
    } else {
        new brahma.User({
            username: user.username,
            password: user.password,
            email: user.email,
            password_change_needed: false,
            device_type: user.device_type,
            roles: user.role,
            latency: '',
            Status: '',
            bandwidth: '',
            volume_id: ''
        }).save(function (err,u,num) {
            if (err) {
                res.json(500, {msg: 'Error adding user: ' + err.message});
            } else {
                res.json(200, {id: u.id});
            }
        });
    }
};

// DELETE /services/user/:username
exports.deleteUser = function (req, res) {
    var username = req.params.username;
    if (!username) {
        res.json(400, {msg: 'Missing required fields'});
    } else {
        brahma.User.findOne({username: username}, function (err, user) {
            if (err) {
                res.json(500, {msg: 'Error finding user to delete: ' + err.message});
            } else if (!user) {
                res.json(404, {msg: 'User not found'});
            } else {
                user.remove();
                res.json(200, {});
            }
        });
    }
};

// PUT /services/user/:username
exports.updateUser = function (req, res) {
    var username = req.params.username;
    var updates = req.body.update;
//    console.log(typeof updates);
//    var test = updates.prototype.toString;
//var obj = {name: "foo", id: 1, age: 45};
//JSON.stringify(obj, ['name', 'id']);
    //var string_updates = JSON.stringify(updates, ['latency', 'bandwidth', 'Status']);
    //var new_updates = JSON.parse(string_updates);
    var test_latendy = req.body.latency;
    var test_bandwidth = req.body.bandwidth;
    var test_Status = req.body.Status;
    var new_updates = {Status: test_Status, bandwidth: test_bandwidth, latency: test_latendy};

//    console.log("update = ",updates);
//    console.log("string update = "+string_updates);
//    console.log("test data = ",new_updates);

    if (!username || !updates) {
        res.json(400, {msg: 'Missing required fields'});
    } else {
        brahma.User.update({username: username}, updates, function (err, numberAffected, raw) {
            if (err) {
                res.json(500, {msg: 'Error updating user: ' + err.message});
            } else if (numberAffected === 0) {
                res.json(404, {msg: 'User not found'});
            } else {
                res.json(200, {});
            }
        });
    }
};


// POST /services/user/:username
exports.updateUserInfo = function (req, res) {
    var username = req.params.username;
    var test_latency = req.body.latency;
    var test_bandwidth = req.body.bandwidth;
    var test_Status = req.body.Status;
    var test_IP = req.body.IP;
    var updates = new Object;
    var isUser = true;

    if (test_latency) {
        var data = "latency";
        updates[data] = test_latency;
    }

    if (test_bandwidth) {
        var data = "bandwidth";
        updates[data] = test_bandwidth;
    }

    if (test_Status) {
        var data = "Status";
        updates[data] = test_Status;
    }

    if (test_IP) {
        isUser = false;
    }
    if (!test_latency && !test_bandwidth && !test_Status) {
        res.json(400, {msg: 'Missing required fields'});
    } else {
          if (isUser) {
                brahma.User.update({username: username}, updates, function (err, numberAffected, raw) {
                    if (err) {
                        res.json(500, {msg: 'Error updating user: ' + err.message});
                    } else if (numberAffected === 0) {
                        res.json(404, {msg: 'User not found'});
                    } else {
                        res.json(200, {});
                    }
                });
          } else {
                brahma.User.update({vm_ip: test_IP}, updates, function (err, numberAffected, raw) {
                    if (err) {
                        res.json(500, {msg: 'Error updating user: ' + err.message});
                    } else if (numberAffected === 0) {
                        res.json(404, {msg: 'User not found'});
                    } else {
                        res.json(200, {});
                    }
                });

          }
    }
};


