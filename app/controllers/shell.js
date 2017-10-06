/*
 *
 * author phchi 14502
 *
 */

'use strict';

var
    exec = require('exec'),
    account = require('./account'),
    child_process = require('child_process'),
    //script_folder_path = '/opt/BRAHMA/checkAvailUser.sh';
    logger = require('../../lib/logger'),
    script_folder_path = '/opt/BRAHMA/';

// UPDATE
// PUT /services/vm-session
// body {username: '', lastAction: '', connectTime: ''}
// Response 200 {msg: msg}
// 400 missing parameter(s)
// 500 other errors
exports.getAvailUser = function (req, res) {
    logger.silly("[DEBUG] getAvailUser API");
    child_process.exec(script_folder_path+"getPoolIP.sh",function(stderr,stdout,err){
      if (err) {
         res.json(500, {msg: 'Error updateing user'});
      } else {
	   req.body.username="guest";
	   req.body.password="guest";
	   account.login(req,res);
  }});
};

exports.getAvailVM = function (req, res) {
    logger.silly("[DEBUG] getAvailVM API");
    child_process.exec(script_folder_path+"getPoolIP.sh",function(stderr,stdout,err){
      if (err) {
         res.json(500, {msg: 'Error updateing user'});
      } else {
	   req.body.username="guest";
	   req.body.password="guest";
	   account.login(req,res);
  }});
};

exports.getAvailBoard = function (req, res) {
    logger.silly("[DEBUG] getAvailBoard API");

/*
           req.body.username="board";
           req.body.password="board";
console.log("[DEBUG] username = " + req.body.username);
console.log("[DEBUG] password = " + req.body.password);
account.login(req,res);
*/


    child_process.exec(script_folder_path+"getPoolBoard.sh",function(stderr,stdout,err){
      if (err) {
         res.json(500, {msg: 'Error updateing user'});
      } else {
         if (stdout.trim() == "Success" ) {
           //res.json(200, {"Msg": "No have avail vm for use","Status": "Wait"});
           req.body.username="board";
           req.body.password="board";
           //req.body.username="android17";
           //req.body.password="a";

           //req.body.username="android13";
           //req.body.password="a";
           account.login(req,res);
         } else {

           //res.json(202, {msg: "No have avail Board for use" , Status: "Wait"});
           res.json(202, {msg: "No have avail Board for use"});
           //callback(stdout);
    }
   }});

};


exports.RestartMachine = function (req, res) {
    var username = req.body.username;
    console.log("Username = " + username);
    child_process.exec(script_folder_path + "restartMachine.sh "+username,function(stderr,stdout,err){
      if (err) {
         res.json(500, {msg: 'Error restart machine'});
      } else {
         var statusCode = stdout.trim();
         if ( statusCode == "0" ) {
           res.json(200, {msg: 'Restart Success'});
         } else {
           res.json(200, {msg: 'Restart Fail'});
         }
      }
      //callback(stdout);
    });
};

exports.errorReporter = function (req, res) {
    var date = req.body.date;
    var log = req.body.log;
    child_process.exec(script_folder_path + "errorReporter.sh \""+ date +"\" \"" + log + "\"",function(stderr,stdout,err){
      if (err) {
         res.json(500, {msg: 'Error post log'});
      } else {
         var statusCode = stdout.trim();
console.log("[DEBUG] stdout = " + statusCode);
         if ( statusCode == "0" ) {
           res.json(200, {msg: 'Post Success'});
         } else {
           res.json(200, {msg: 'Post Fail'});
         }
      }
      //callback(stdout);
    });
};


exports.checkAppList = function (req, res) {
    logger.silly("[DEBUG] checkAppList API");
    child_process.exec(script_folder_path + "checkAppList.sh",function(stderr,stdout,err){
      if (err) {
         res.json(500, {msg: 'Error post log'});
      } else {
         var statusCode = stdout.trim();
           res.json(200, {"status": statusCode});
         }
      //callback(stdout);
    });
};

