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


module.exports = function (grunt) {

    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        mochaTest: {
            src: ['test/**/*.js'],
            options: {
                reporter: 'spec',
                require: 'server.js'
            }
        }
    });

    // Load NPM tasks
    require('load-grunt-tasks')(grunt);

    // Making grunt default to force in order not to break the project.
    grunt.option('force', true);

    // Run like: > grunt create-server-token:dave
    grunt.registerTask('create-admin-service-token', 'Make Token', function (username) {
        var
            fs = require('fs'),
            brahma = require('./lib/brahma'),
            shell = require('shelljs'),
            jwt = require('jsonwebtoken');

        if (typeof username === 'undefined' || username == '') {
            console.log('Error: no subject provided for token creation');
            console.log('Usage: grunt create-admin-service-token:username');
            return;
        }

        brahma.init();
        var pass = brahma.config.get('private_key_pass');
        var file = brahma.config.get('private_key');
        process.env.passphrase = pass;
        var command = 'openssl rsa -in ' + file + ' -passin env:passphrase';
        var privKey = shell.exec(command, {silent: true}).output;
        delete process.env.passphrase;

        console.log("Create token for: ", username);
        var token = jwt.sign({sub: username, role: 'admin'}, privKey, {algorithm: brahma.config.get('jwt_signing_alg')});
        console.log(token);
    });

    grunt.registerTask('add-default-admin', 'add default admin account to the database', function () {
        var
            brahma = require('./lib/brahma'),
            done = this.async();

        brahma.init();

        brahma.User.find({username: 'mitre', roles: 'admin'}, function (err, admins) {
            if (admins && admins.length === 0) {
                var default_admin = {
                    username: 'mitre',
                    password: 'mitre1234',
                    email: 'mitre@here.com',
                    approved: true,
                    roles: ['admin']
                };
                brahma.User.create(default_admin, function (err, r) {
                    if (err) {
                        console.log(err);
                        brahma.shutdown();
                        done();
                    } else {
                        console.log('Created user: ', default_admin);
                        brahma.shutdown();
                        done();
                    }
                });
            } else {
                console.log('Default admin already exists!');
                brahma.shutdown();
                done();
            }
        });
    });

    grunt.registerTask('remove-default-admin', 'remove default admin account from the database', function () {
        var
            brahma = require('./lib/brahma'),
            done = this.async();

        brahma.init();

        brahma.User.findOne({username: 'mitre'}, function (err, defaultAdmin) {
            if (err) {
                console.log(err);
                brahma.shutdown();
                done();
            } else {
                if (defaultAdmin) {
                    defaultAdmin.remove(function (errR, result) {
                        if (errR) {
                            console.log(errR);
                            brahma.shutdown();
                            done();
                        } else {
                            console.log('Remove default admin: ', result);
                            brahma.shutdown();
                            done();
                        }
                    });

                } else {
                    console.log('Default admin account does not exist');
                    brahma.shutdown();
                    done();
                }
            }
        });
    });

    // Default task(s).
    grunt.registerTask('default', ['mochaTest']);
};
