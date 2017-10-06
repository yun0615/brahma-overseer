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

//var fileModel = require('../controllers/meetingFile');

var fileModel = require('../../model/fileinfo_model');

var meetingModel = require('../../model/meetinginfo_model');

//var meetingModel = require('../controllers/meetingRoom');

var multer = require('multer');
var fs = require('fs');
var moment = require('moment');

module.exports = function (app) {

    var checkAuthDeve = function (req, res, next){
        if (!req.session.username){
            res.redirect('/');
        } else {
            if (req.session.roles != "developer"){
                res.redirect('/');
            }else {
                next();
            }
        }
    }

    var checkAuthMeeting = function(req, res, next){
        var host = req.session.username;
    
        if(!req.session.meetingID){
            res.redirect('/page_404');
        }else{
            var condition = {meetingID:req.session.meetingID};

            meetingModel.findOne(condition).exec(function(err, result){
                if(err) throw err;
                if(!result){
                    res.redirect('/page_404');
                }else{
                    if(host == result.hostID){
                        next();
                    }else{
                        res.redirect('/page_404');
                    }
                }
            }); 
        }    
    }

    app.use('/developer', checkAuthDeve);

    app.use('/developer/meeting', checkAuthMeeting);
	
    /*-------------------- Home --------------------*/
    app.route('/developer').get(function(req,res){
    	res.render('developer/dashboard');
    });


    /*-------------------- Meeting --------------------*/
    app.route('/developer/show_rooms').get(function(req,res){
        var condition = {hostID:req.session.username};
        
        meetingModel.find(condition).exec(function(err, results){
            if(err){
                var data = [];
                res.render('developer/show_rooms',{data:data});
            }else{
                var data = results;
                res.render('developer/show_rooms',{data:data});
            }
        });
    });

    app.route('/developer/show_room_detail/:meetingID').get(function(req,res){
        var condition = {meetingID:req.params.meetingID};
        var host = req.session.username;    

        meetingModel.findOne(condition).exec(function(err, results){
            if(err) throw err;

            if(!results){
                var meetingData = [];
                var fileData = [];
                res.redirect('/page_404');
            }else if(host != results.hostID){
                res.redirect('/page_404');
            }else{
                var meetingData = results;
                req.session.meetingName = meetingData.meetingName;
                fileModel.find(condition).exec(function(err, result){
                    if(!result.length){
                        var fileData = [];
                    }else{
                        var fileData = result;
                    }
                    req.session.meetingID = meetingData.meetingID;                    
                    res.render('developer/show_room_detail',{meetingData:meetingData,fileData:fileData,moment:moment});
                });
            }
        });
    });

    app.route('/developer/meeting/upload_file').get(function(req,res){
        var meetingID = req.session.meetingID;
        var meetingName = req.session.meetingName;
        res.render('developer/upload_file',{meetingID:meetingID,meetingName:meetingName});
    });

    app.route('/developer/meeting/upload_file').post(function(req,res){
        var meetingID = req.session.meetingID;
        var fileLocation = '/opt/NFS/' + meetingID;
        var storage = multer.diskStorage({
            destination: function(req,file,cb){
                    cb(null,fileLocation);
            },
            filename: function(req,file,cb){
                    cb(null,file.originalname);
            }
        });

        var upload = multer({
            storage: storage
        }).single('file');

        upload(req,res, function(err){
            if(err){
                var file = req.file;
                console.log("upload file faild: " + err);
                return;
            } 

            if(typeof req.file != "undefined"){
                var file = req.file;
                console.log("upload file success: " + file.originalname);

                var size = file.size;
                var sizekb = (size/1024).toFixed(2) + "kb";

                var period = req.body.period;
                var filename = req.body.filename;
                console.log(period);
                var splitDate = period.split(" ");
                var startDate = splitDate[0];
                var endDate = splitDate[2];

                var data = {
                    meetingID : meetingID,
                    filename : file.originalname,
                    filesize : sizekb,
                    startDate : startDate,
                    endDate : endDate
                }

                new fileModel(data).save(function(err) {
                    if(err) throw err;
                    console.log("file info save to database");
                    res.redirect("/developer/show_room_detail/" + meetingID);
                });

            }else{
                console.log("Maybe you forget to add 'enctype=multipart/form-data' in form attribute");
            }
        });
    });

    app.route('/developer/meeting/delete_file/:fileID/:filename').get(function(req,res){
        var fileID = req.params.fileID;
        var filename = req.params.filename;
        var path = "/opt/NFS/" + req.session.meetingID + "/" + filename;
        fs.unlink(path,function(){
            fileModel.remove({"_id":fileID},function(err, result){
                if(err) {
                    res.redirect('/page_404');
                }else{
                    res.redirect('/developer/show_room_detail/' + req.session.meetingID);
                }
            });
        });
        
    });

    app.route('/developer/app').get(function(req,res){
    	res.render('developer/app');
    });

    app.route('/developer/platform').get(function(req,res){
	res.render('developer/platform');
    });

    app.route('/developer/client_app').get(function(req,res){
    	res.render('developer/client_app');
    });

    app.route('/developer/department').get(function(req,res){
    	res.render('developer/department');
    });

    app.route('/developer/show_app_detail').get(function(req,res){
    	res.render('developer/show_app_detail');
    });

    app.route('/developer/upload_apk').get(function(req,res){
    	res.render('developer/upload_apk');
    });


};
