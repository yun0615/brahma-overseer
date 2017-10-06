/*
 *
 * author yun
 *
 */

'use strict';

var
    brahma = require('../../lib/brahma'),
    logger = require('winston');


exports.addAppClientLog = function (req, res) {

    var username = req.body.username;
    var message = req.body.message;

    if(typeof req.body.ipAddress !== 'undefined'){
        var ip = req.body.ipAddress;
    }else{
        var ip = req.connection.remoteAddress;
    }

    var ipAddress = ip.replace(/(^\D*)/g,"");

    if(typeof req.body.os !== 'undefined'){
        var os = req.body.os;
    }else{
        var os = "";
    }

    if(typeof req.body.device !== 'undefined'){
        var device = req.body.device;
    }else{
        var device = "";
    }
  
    var markRegex = /([.*+?^=&~!@#&<>,"';:${}()|\[\]\/\\])/g;
    var userRegex = username.match(markRegex);
    //var deviceRegex = device.match(markRegex);

    if(userRegex){
        logger.info("Error adding appClient Log: The data you gived is incorrect");
        res.json(200, {msg: 'Error adding appClient Log: The data you gived is incorrect' });
    }else{
        new brahma.appClientLog({
            username: username,
            ipAddress: ipAddress,
            device: device,
            os: os,
            message: message
        }).save(function(err){
            if(err){
                logger.info("Error adding appClient Log : "+ err);
                res.json(200, {msg: 'Error adding appClient Log: ' + err.message});
            }else{
                res.json(200, { msg:"success adding appClient Log"});
            }
        });
    }
};



exports.addWebPortalLog = function(logData){
    new brahma.webLog(logData).save(function(err){
        if (err) throw err;
    });
};
