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
var brahma = require('../../lib/brahma');

function logAccess(req, res, next){
    brahma.logger.info("[DEBUG] ######## ");
    brahma.logger.info('%s %s %s %s', new Date().toString(), req.ip, req.user.username, req.path);
    brahma.logger.info("[DEBUG] ######## ");
    next();
}


module.exports = function (app) {

    var account = require('../controllers/account'),
        users = require('../controllers/users'),
        vmSessions = require('../controllers/vm-sessions'),
        cloud = require('../controllers/cloud'),
        shell = require('../controllers/shell'),
        auth = require('../../lib/authentication'),
        log = require('../controllers/log'),
    //-------------------------------------------------
        confAuth = require('../controllers/confAuth'),
	meetingRoom = require('../controllers/meetingRoom'),
    //-------------------------------------------------
        fs = require('fs');


    /******  User Account ******/
    app.route('/vmStatus').get(function(req,res){
        var filename = "/opt/BRAHMA/Board/Status";
       fs.readFile(filename, "utf8", function(err, data) {
            if (err) throw err;
            var rawData = data.toString();
            var dataLine = rawData.split('\n');

            var jsonArr = [];

            for (var i = 0; i < dataLine.length; i++) {
                var eachData = dataLine[i].split(',');
                jsonArr.push({
                    machine: eachData[0],
                    status: eachData[1]
                });
            }

            //resp.write(data);
            //resp.end();
            res.render('vmStatus', {data:jsonArr});
        });
        
    });

    app.route('/login')
        .post(account.login);

    app.route('/page_404').get(function(req,res){
        res.render('page_404');
    });

    /** app get package name **/
    app.route('/getPackageName').post(function(req,res){
        res.json({msg:"com.github.barteksc.full"});
    });

    app.route('/confSignin')
        .post(confAuth.confSignin);


    app.route('/meeting/signinID')
        .post(meetingRoom.signinID);

    //** Brahma **/
    app.route('/services/restartMachine')
        .post(shell.RestartMachine);

    app.route('/services/getAvailUser')
        .post(shell.getAvailUser);

    app.route('/services/getAvailVM')
        .post(shell.getAvailVM);

    app.route('/services/getAvailBoard')
        .post(shell.getAvailBoard);

 //-------------------------------------
    app.route('services/checkAppList')
        .post(shell.checkAppList);
 //-------------------------------------
 
    app.route('/services/errorReporter')
        .post(shell.errorReporter);

    // auth token required in header for access
    app.route('/changePassword')
        .post(account.changeUserPassword);

 //--------------------------------------
   /** add app client log **/
    app.route('/log/addAppClientLog')
       .post(log.addAppClientLog);
 //----------------------------------------



    /****** Admin Services ******/
   /** Any url prefixed with /services/* requires admin privs **/

   // API: check Token for admin role to /services/*
   app.all('/services/*', auth.checkAdminToken);

    /** Users **/
    app.route('/services/users')
        .get(users.listUsers);
        
 //-------------------------------------------------
    app.route('/services/user/:username')
        .get(users.getUser)
        .delete(users.deleteUser)
        .put(users.updateUser)
        .post(users.updateUserInfo);
 //--------------------------------------------------       

    app.route('/services/user')
        .post(users.addUser);

    /** VM Sessions **/
    app.route('/services/vm-session')
        .post(vmSessions.createSession)
        .put(vmSessions.updateSession);
        // no need to read or delete from proxy

    /** Cloud **/
    app.route('/services/cloud/setupVm/:username')
        .get(cloud.setUpVm);

    app.route('/services/cloud/devices')
        .get(cloud.listDevices);

    app.route('/services/cloud/assignvolume')
        .post(cloud.assignVolume);

    app.route('/services/cloud/volumes')
        .get(cloud.listVolumes);

    app.route('/services/cloud/volume/create')
        .post(cloud.createVolume);

    app.route('/services/cloud/images')
        .get(cloud.listImages);

};

