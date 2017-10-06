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

module.exports = function (app) {
	
	//  use api
	var client = require('brahma-overseer-client');
	var overseer_url = "http://127.0.0.1:3000";
	var token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9.eyJzdWIiOiJzdm1wLWNvbmZpZy10b29sLTEiLCJqdGkiOiIwNGUwNGM1OS1jMDE3LTRlNzEtYTUxMC01ZWJiZjQ4MWQ5YTYiLCJpc3MiOiJ2bWktMDEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE0NzY3MDE2NjZ9.PqENATN2iBbAjJOg_frVaCCFZ4yAOhXq_D1ZjEoWwetKnq1r6cHLGHQG0tueb9pXnP_J97k5Cb_0ZTq73rTNrDJDO9dzfKNukeXbFBIkj4YluQ5LWeqyFC3uXumPOHyL7vcJTLZk5DbfAq4HHGPaWsSRpy08QeHHlbSkGX8LYlk";
	var api = new client(overseer_url, token);
	var	brahma = require('../../lib/brahma');
	var webLog = require('../controllers/log');

	var checkAuthUser = function (req, res, next){
    	if (!req.session.username){
	        res.redirect('/');
	    } else {
	        if (req.session.roles != "user"){
	            res.redirect('/');
	        }else {
	        	next();
	        }
	    }
    }

    app.use('/client', checkAuthUser);

	/*-------------------- Home --------------------*/
    app.route('/client').get(function(req,res){
    	var ip = req.connection.remoteAddress;
    	var ipAddress = ip.replace(/(^\D*)/g,"");
    	var webLog_data = {
            "user": req.user.username,
            "roles": req.user.roles,
            "action": "visit",
            "ipAddress": ipAddress,
            "message": req.user.username + " visit page - client user info"
        }
        webLog.addWebPortalLog(webLog_data);

       	res.render('client/user_info');
        
    });


    app.route('/client/user_info').post(function(req,res){
        var username = req.body.username;	
		api.getUser(username,function(err, result) {
			if ( typeof result === 'undefined' ) {
				var user = [];
				res.render('client/user_info_table', {
					userData: user
				});
			} else {
				var user = result.body.user;
	
				res.render('client/user_info_table', {
					userData: user
				});
			}
    	});
    });

    app.route('/client/client_app').get(function(req,res){
    	res.render('client/client_app');
    });

    app.route('/client/web_client').get(function(req,res){
    	res.render('client/web_client');
    });

    app.route('/client/sign_up').get(function(req,res){
    	api.listDevices(function(error,result){
	    	res.render('client/sign_up',{device_type:result.body}) ;
	    	// res.send(result.body) ;
		});
    });

    app.route('/client/sign_up').post(function(req,res){
        // URL of the Overseer host and an brahma token with admin privs
  
	   var username = req.body.username ;
	   var password = req.body.password ;
	   var email = req.body.email ;
	   var device_type = req.body.device_type ;

	  	//create user
	  	api.createUser(username,password,email,device_type,function(err, result) {
	    	if(err)console.log(err) ;
	      	else
	      	{
	            /* Update Overseer Database data
	            change user "approved" and "password_change_need" */
            	var user_changed_data = { 
                	"approved" : "true",
                	"password_change_needed" : "false"
            	}
              	// URL of the Overseer host and an brahma token with admin privs
              	var api = new client(overseer_url+'/services/user/'+username,token);          
              	api.updateUser(username,user_changed_data,function(){
                    res.redirect('/client') ;
              	}); 
	      	}
		});
    });

};
