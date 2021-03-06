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



module.exports = function (app) {

    // Root routing
    var console = require('../controllers/console');

    var async = require('async');

    


    app.route('/').get(function(req,res){
        res.render('signin',{hint:""});
    });

    app.route('/signup').get(function(req,res){
        res.render('signup',{hint:""});
    });

    //app.route('/')
    //    .get(console.index);

    // Signup/Register
    app.route('/auth/signup')
        .get(console.listSupportedDevices)
        .post(console.signup);
    // Signin
    app.route('/auth/signin')
        .post(console.signin);
    // Logout
    app.route('/auth/signout')
        .get(console.signout);


    // Change Password
    app.route('/users/password')
        .post(console.requiresLogin, console.changePassword);


    // All Admin Priv
    app.route('/users')
        .get(console.requiresLogin, console.requiresAdmin, console.list)
        .put(console.requiresLogin, console.requiresAdmin, console.update);

    app.route('/users/:uid')
        .get(console.requiresLogin, console.requiresAdmin, console.read)
        .delete(console.requiresLogin, console.requiresAdmin, console.deleteUser)
        .put(console.requiresLogin, console.requiresAdmin, console.update);

    app.route('/users/create/volume').post(console.requiresLogin, console.requiresAdmin, console.createVolume);

    app.route('/cloud/volumes')
        .get(console.requiresLogin, console.requiresAdmin, console.listVolumes);

    app.route('/cloud/images')
        .get(console.requiresLogin, console.requiresAdmin, console.listImagesDevices);

    //app.route('/cloud/startVm')
    //    .post()
};