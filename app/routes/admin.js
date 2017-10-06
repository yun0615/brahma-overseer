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
	
	var vm_model = require('../../model/vm_model');
	
	var exec = require('exec');
	var child_process = require('child_process');
	var script_folder_path = '/opt/BRAHMA/';

	// do log
	var MongoDB = require('winston-mongodb').MongoDB;
	var logger = require('winston');
	logger.add(MongoDB, {db:"mongodb://127.0.0.1/LOG", collection:"UserLOG"});

	//shell
	var shell = require('../../lib/shell');
	var local = require('../../lib/getLocalInfo');

	//async
	var async = require('async');

	var sleep = require('sleep');

	//  use api
	var client = require('brahma-overseer-client');
	var overseer_url = "http://127.0.0.1:3000";
	var token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9.eyJzdWIiOiJzdm1wLWNvbmZpZy10b29sLTEiLCJqdGkiOiIwNGUwNGM1OS1jMDE3LTRlNzEtYTUxMC01ZWJiZjQ4MWQ5YTYiLCJpc3MiOiJ2bWktMDEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE0NzY3MDE2NjZ9.PqENATN2iBbAjJOg_frVaCCFZ4yAOhXq_D1ZjEoWwetKnq1r6cHLGHQG0tueb9pXnP_J97k5Cb_0ZTq73rTNrDJDO9dzfKNukeXbFBIkj4YluQ5LWeqyFC3uXumPOHyL7vcJTLZk5DbfAq4HHGPaWsSRpy08QeHHlbSkGX8LYlk";
	var api = new client(overseer_url, token);

    var mail = require('../../lib/mail');
	var	brahma = require('../../lib/brahma');

	var moment = require('moment');

	var fs = require('fs');

	//get server ip,netMask,gateway,dns
	var os = require('os');
	var network = require('network');
	var dns = require('dns');

	var webLog = require('../controllers/log');

	var checkAuth = function (req, res, next){
    	if (!req.session.username){
	        res.redirect('/');
	    } else {
	        if (req.session.roles != "admin"){
	            res.redirect('/');
	        }else {
	        	next();
	        }
	    }
    }

    app.use('/admin', checkAuth);

	/*-------------------- Approve account --------------------*/
	app.route('/accountVerify/:email_id').get(function(req,res){
        var email_id = req.params.email_id;
		var ip = req.connection.remoteAddress;
    	var ipAddress = ip.replace(/(^\D*)/g,"");
        brahma.User.find({email_id: email_id})
			.select('username roles email_id')
	    	.exec(function (err, results) {
		        if (err) {
		        	var webLog_data = {
			            "user": '',
			            "roles": '',
			            "action": "authentic account",
						"ipAddress": ipAddress,
			            "message": "authentic account fail - email_id: " + email_id
			        }
			        webLog.addWebPortalLog(webLog_data);
			      	logger.info("verify account fail : "+ err);
		           	res.render('acctVerifyFail'); 
		        }else {
		        	var username = results[0].username;
					var webLog_data = {
			            "user": username,
			            "roles": results[0].roles,
			            "action": "authentic account",
			            "ipAddress": ipAddress,
			            "message": username + " authentic account success - email_id: " + email_id
			        }
			        webLog.addWebPortalLog(webLog_data);
			       	
			      	var user_changed_data={
			            "approved": "true",
			            "password_change_needed": "false"
			        }
			        api.updateUser(username, user_changed_data, function() {
			            res.render('acctVerifySuccess');
			        });          
		           
		        }
		    });

    });



	/*-------------------- Home --------------------*/
    app.route('/admin').get(function(req,res){
    	////////////////////////////////
    	var username = req.session.username;
    	var roles = req.session.roles;
    	var ip = req.connection.remoteAddress;
    	var ipAddress = ip.replace(/(^\D*)/g,"");
        var webLog_data = {
            "user": username,
            "roles": roles,
            "action": "visit",
            "ipAddress": ipAddress,
            "message": username + " visit page - admin dashboard"
        }
        webLog.addWebPortalLog(webLog_data);
      	logger.info("Admin login dashboard");
        res.render('admin/dashboard', {
			title: 'brahma_backend'
		});
        ////////////////////////////////
    });



    /*-------------------- Application -------------*/
    app.route('/admin/app_list').get(function(req,res){
        ////////////////////////////////
        var username = req.session.username;
    	var roles = req.session.roles;
    	var ip = req.connection.remoteAddress;
    	var ipAddress = ip.replace(/(^\D*)/g,"");
        var webLog_data = {
            "user": username,
            "roles": roles,
            "action": "visit",
            "ipAddress": ipAddress,
            "message": username + " visit page - app list"
        }
        webLog.addWebPortalLog(webLog_data);
       	res.render('admin/app_list');
        ////////////////////////////////
    });

    app.route('/admin/show_appClass').post(function(req,res){
    	var appClass = req.body.appClass;
	    var newData={
	        className:appClass,
	        appName:appClass
	    }
	    ////////////////////////////////
        var username = req.session.username;
    	var roles = req.session.roles;
    	var ip = req.connection.remoteAddress;
    	var ipAddress = ip.replace(/(^\D*)/g,"");
    	var webLog_data = {
            "user": username,
            "roles": roles,
            "action": "visit",
            "ipAddress": ipAddress,
            "message": username + " visit page - app list and show " + appClass
        }
       	webLog.addWebPortalLog(webLog_data);
       	res.render('admin/show_app_class', {
	        data: newData
	    });
        ////////////////////////////////	    
    });

    app.route('/admin/app').get(function(req,res){
        res.render('admin/app');
    });

    app.route('/admin/app_request').get(function(req,res){
    	res.render('admin/app_request');
    });

    app.route('/admin/show_app_detail').get(function(req,res){
    	res.render('admin/show_app_detail');
    });

    app.route('/admin/show_app_request_detail').get(function(req,res){
    	res.render('admin/show_app_request_detail');
    });

    app.route('/admin/upload_apk').get(function(req,res){
    	res.render('admin/upload_apk');
    });



    app.route('/admin/monitor_cpu_detail').get(function(req,res){
    	////////////////////////////////
        var username = req.session.username;
    	var roles = req.session.roles;
    	var ip = req.connection.remoteAddress;
    	var ipAddress = ip.replace(/(^\D*)/g,"");
	    var webLog_data = {
	        "user": username,
	        "roles": roles,
	        "action": "visit",
	        "ipAddress": ipAddress,
	        "message": username + " visit page - monitor cpu detail"
	    }
	    webLog.addWebPortalLog(webLog_data);
    	logger.info("Admin monitor CPU");
		//shell.write_log("Admin monitor CPU");
    	res.render('admin/monitor_cpu_detail');
	    ////////////////////////////////
    });

    app.route('/admin/monitor_memory_detail').get(function(req,res){
    	////////////////////////////////
        var username = req.session.username;
    	var roles = req.session.roles;
    	var ip = req.connection.remoteAddress;
    	var ipAddress = ip.replace(/(^\D*)/g,"");
	    var webLog_data = {
	        "user": username,
	        "roles": roles,
	        "action": "visit",
	        "ipAddress": ipAddress,
	        "message": username + " visit page - monitor memory detail"
	    }
	    webLog.addWebPortalLog(webLog_data);
    	logger.info("Admin monitor Memory");
    	res.render('admin/monitor_memory_detail');
	    ////////////////////////////////
    });

    app.route('/admin/monitor_network_detail').get(function(req,res){
    	////////////////////////////////
        var username = req.session.username;
    	var roles = req.session.roles;
    	var ip = req.connection.remoteAddress;
    	var ipAddress = ip.replace(/(^\D*)/g,"");
	    var webLog_data = {
	        "user": username,
	        "roles": roles,
	        "action": "visit",
	        "ipAddress": ipAddress,
	        "message": username + " visit page - monitor network detail"
	    }
	    webLog.addWebPortalLog(webLog_data);
    	res.render('admin/monitor_network_detail');
	    ////////////////////////////////
    });

    app.route('/admin/upload_apk').get(function(req,res){
    	/*
		console.log("[DEBUG] Run monitor Network");
		    logger.info("Admin monitor Network", { seriously: true }, function(err, level, msg, meta) {
		console.log("[DEBUG] Refresh Network Page");

		        res.render('admin/monitor_network_detail');
		    });
		*/


		//    logger.info("Admin monitor Network", { seriously: true });
		//console.log("[DEBUG] Logger monitor Network");
		//        res.render('admin/monitor_network_detail');



		/*
		    async.series([
		            function(callback) {
		shell.write_log("Admin monitor CPU");
		//    console.log("[DEBUG] Admin monitor network");
		            },
		            function(callback) {
		    res.render('admin/monitor_network_detail');
		            }
		        ],
		        function(error, result) {
		    res.render('admin/');
		        }
		    );
		*/


		//console.log("[DEBUG] Admin monitor network");
		////////////////////////////////
        var username = req.session.username;
    	var roles = req.session.roles;
    	var ip = req.connection.remoteAddress;
    	var ipAddress = ip.replace(/(^\D*)/g,"");
	    var webLog_data = {
	        "user": username,
	        "roles": roles,
	        "action": "visit",
	        "ipAddress": ipAddress,
	        "message": username + " visit page - upload apk"
	    }
	    webLog.addWebPortalLog(webLog_data);
    	res.render('admin/upload_apk');
	    ////////////////////////////////
    	//logger.info("Admin monitor Network");
    });


    app.route('/admin/show_log').get(function(req,res){
    	var MongoClient = require('mongodb').MongoClient,
        format = require('util').format,
        logs;

	    async.series([
	            function(callback) {
	                MongoClient.connect('mongodb://127.0.0.1:27017/brahma_overseer_production_db', function(err, db) {
	                    if (err) throw err;
	                    // Fetch the collection test
	                    var collection = db.collection('usersessions');
	                    collection.find().sort({lastAction: -1}).toArray(function(err, docs) {
	                        if (docs !== null) {
	                            logs = docs
	                        }
	                        //docs.forEach(function(doc) {
	                            //console.log("Time: %s, Level: %s, Context: %s", doc.timestamp, doc.level, doc.message);
				//    var res = doc.timestamp.toString().replace("/T/", " ").replace("(CST)","").replace("GMT+0800","");
				//    doc.timestamp = res;
	                        //});
	                        //    logs = docs
	                        db.close();
	                        res.render('admin/show_log', {
	                            all_log_data: logs
	                        });
	                    });
	                });
	            },
	            function(callback) {
	                db.close();
	            }
	        ],
	        function(error, result) {
	            res.render('admin/show_log', {
	                all_log_data: logs
	            });
	        }
	    );
    });

    app.route('/admin/show_webLog').get(function(req,res){
    	var username = req.session.username;
    	var roles = req.session.roles;
    	var ip = req.connection.remoteAddress;
    	var ipAddress = ip.replace(/(^\D*)/g,"");
    	var webLog_data = {
	        "user": username,
	        "roles": roles,
	        "action": "visit",
	        "ipAddress": ipAddress,
	        "message": username + " visit page - webLog"
	    }
	    webLog.addWebPortalLog(webLog_data);
	    brahma.webLog.find({}).sort({time: -1}).exec(function(err, results){
	    	if(err){
	      		var logs = [];
	      		res.render('admin/show_webLog',{data:logs,moment:moment});
	      	}else{
	      		var logs = results;
	      		res.render('admin/show_webLog',{data:logs,moment:moment});
	      	}
	    });
    });


    app.route('/admin/show_appClientLog').get(function(req,res){
    	var username = req.session.username;
    	var roles = req.session.roles;
    	var ip = req.connection.remoteAddress;
    	var ipAddress = ip.replace(/(^\D*)/g,"");
    	var webLog_data = {
	        "user": username,
	        "roles": roles,
	        "action": "visit",
	        "ipAddress": ipAddress,
	        "message": username + " visit page - appLog"
	    }
	    var ip = req.session.ip
	    webLog.addWebPortalLog(webLog_data);
	    brahma.appClientLog.find({}).sort({time: -1}).exec(function(err, results){
	    	if(err){
	      		var logs = [];
	      		res.render('admin/show_appClientLog',{data:logs,moment:moment});
	      	}else{
	      		var logs = results;
	      		res.render('admin/show_appClientLog',{data:logs,moment:moment});
	      	}
	    });
    });

    app.route('/admin/reset').get(function(req,res){
    	res.render('admin/reset');
    });

    app.route('/admin/reset').post(function(req,res){
    	var ip = req.body.ip;
	    console.log("[DEBUG] ip = %s",ip);
	    shell.reset_board(ip);
	    res.render('admin/dashboard');
    });


    app.route('/admin/client_app').post(function(req,res){
    	res.render('admin/client_app');
    });

   
    /*-------------------- Arm Cluster ---------------*/
    app.route('/admin/arm').get(function(req, res){

	var MongoClient = require('mongodb').MongoClient,
		format = require('util').format,
		arm_data;

	async.series([
    		function(callback) {
	            	MongoClient.connect('mongodb://127.0.0.1:27017/brahma_arm_cluster', function(err, db) {
		               	if (err) throw err;
	        	    	// Fetch the collection test
	                	var collection = db.collection('board');
	                	collection.find().sort({lastAction: -1}).toArray(function(err, docs) {
	                    	if (docs !== null) {
	                    	    arm_data = docs
	                    	}
	                    //docs.forEach(function(doc) {
	            	        //console.log("Time: %s, Level: %s, Context: %s", doc.timestamp, doc.level, doc.message);
				//    var res = doc.timestamp.toString().replace("/T/", " ").replace("(CST)","").replace("GMT+0800","");
				//    doc.timestamp = res;
	                        //});
	                        //    logs = docs
	                    	db.close();
	                    	res.render('admin/arm', {
	                        	all_arm_data: arm_data
	                        });
	                    });
	                });
	            },
	            function(callback) {
	                db.close();
	            }
	        ],
	        function(error, result) {
	            res.render('admin/show_log', {
	                all_log_data: logs
	            });
	        }
	 );
    });

    /*-------------------- Virtual Machine ---------------*/
    app.route('/admin/vm').get(function(req,res){
    	/*
	      Step:
	        1. Use Resful API to get All User Data (指派機器時會用到)
	        2. Get VM data 
	    */
    	var vm = vm_model();
    	var users;

    	// var api = new client(overseer_url+'/services/users',token);
		////////////////////////////////
        var username = req.session.username;
    	var roles = req.session.roles;
    	var ip = req.connection.remoteAddress;
    	var ipAddress = ip.replace(/(^\D*)/g,"");
    	var webLog_data = {
	        "user": username,
	        "roles": roles,
	        "action": "visit",
	        "ipAddress": ipAddress,
	        "message": username + " visit page - vm"
	    }
	    webLog.addWebPortalLog(webLog_data);
	  
		//get all users
    	api.listUsers(function(err, result) {
			if ( typeof result === 'undefined' ) {
	 			var vm_data = [];
	  			var users = [];
            	res.render('admin/vm', {all_vm_data: vm_data, users_data: users})
			} else {
        		users = result.body.users;
          		var result = vm.get_all_data(function(vm_data) {
            		res.render('admin/vm', {
                		all_vm_data: vm_data,
                		users_data: users
              		});
          		});
			}
    	});
	
	    ////////////////////////////////	
    });


    app.route('/admin/create_vm').get(function(req,res){
		////////////////////////////////
	    var username = req.session.username;
	    var roles = req.session.roles;
    	var ip = req.connection.remoteAddress;
    	var ipAddress = ip.replace(/(^\D*)/g,"");
	    var webLog_data = {
	        "user": username,
	        "roles": roles,
	        "action": "visit",
	        "ipAddress": ipAddress,
	        "message": username + " visit page - create vm"
	    }
	    webLog.addWebPortalLog(webLog_data);
	   	res.render('admin/create_vm');
	    ////////////////////////////////
    	
    });

    app.route('/admin/department').get(function(req,res){
    	res.render('admin/department');
    });


    app.route('/admin/assign_user').post(function(req,res){
    	var username = req.body.select_user;
	    var vm_number = req.body.vm_number;

	    /*
	      Step:
	        1. Get VM Data.
	        2. Use  Reesful API to update Overseer data
	        3. Update the data.
	    */

	    //get vm data
	    var vm = vm_model();
	    var vm_data = {
	        "VM_ID": "VM_" + vm_number
	    }

	    var result = vm.get_data(vm_data, function(vmdata) {
	        if (vmdata == null)
	            res.redirect('/admin/vm');
	        else {
	            //Update Overseer Database data
	            vm_data = {
	                    "vm_id": vmdata.VM_ID,
	                    "vm_ip": vmdata.IP
	                }
	                // URL of the Overseer host and a Brahma token with admin privs
	                // var api = new client(overseer_url+'/services/user/'+username,token);

	            //Update Overseer User Data
	            api.updateUser(username, vm_data, function() {
	                var vm_data = {
	                    "User": username
	                };
	                //Update vm data which is in database "brahma_website" collection "vm_model"
	                vm.update_data("VM_" + vm_number, vm_data, function() {
	                    res.redirect('/admin/vm');
	                });

	            });
	        }
	    });
    });

    app.route('/admin/remove_assign/:vm_id').get(function(req,res){
    	/*
	        Step:
	          1. Get VM Data.
	          2. Use Resful API to update overseer database
	          3. Update the data which is in database. 
    	*/
	    var vm_number = req.params.vm_id;
	    //Get VM Data
	    var vm = vm_model();
	    var vm_data = {
	        "VM_ID": "VM_" + vm_number
	    }

	    var result = vm.get_data(vm_data, function(vmdata) {
	        if (vmdata == null)
	            res.redirect('/admin/vm');
	        else {
	            //Update Overseer Database Data
	            vm_data = {
	                "vm_id": "",
	                "vm_ip": ""
	            }

	            var username = vmdata.User;
	            // var api = new client(overseer_url+'/services/user/'+username,token);                 
	            api.updateUser(username, vm_data, function() {
	                var vm_data = {
	                    "User": ""
	                };

	                //Update vm data which is in database "brahma_website" collection "vm_model"
	                vm.update_data("VM_" + vm_number, vm_data, function() {
	                    res.redirect('/admin/vm');
	                });

	            });
	        }
	    });
    });


    app.route('/admin/show_vm_detail').get(function(req,res){
    	res.render('admin/show_vm_detail');
    });

    app.route('/admin/add_vm').post(function(req,res){
    	var count = req.body.number; //要開的機器台數
	    var i;
	    var VM_ID;

    	////////////////////////////////
	    var username = req.session.username;
	    var roles = req.session.roles;
    	var ip = req.connection.remoteAddress;
    	var ipAddress = ip.replace(/(^\D*)/g,"");
	    var webLog_data = {
	        "user": username,
	        "roles": roles,
	        "action": "add vm",
	        "ipAddress": ipAddress,
	        "message": username + " add vm"
	    }
	    webLog.addWebPortalLog(webLog_data);
	    
    	//for (i = 1; i <= count; i++) {
        //run QEMU
		logger.info("Admin start "+count+" vms");
	        shell.run_vm("", count);
	    //}
	    res.redirect('/admin/vm') ;

	    ////////////////////////////////
    });

    app.route('/remove_vm/:vm_id').get(function(req,res){
    	/*
	       Step:
	          1. Get VM data.
	          2. Use Resful API to update Overseer data.
	          3. Delete VM data.
	    */

	    var vm_number = req.params.vm_id;

	    //Get VM Data
	    var vm = vm_model();
	    var vm_data = {
	        "VM_ID": "VM_" + vm_number
	    }

	    var result = vm.get_data(vm_data, function(vmdata) {
	        if (vmdata == null) {
	            res.redirect('/admin/vm');
	        } else {

	            //Update Overseer Database Data
	            vm_data = {
	                "vm_id": "",
	                "vm_ip": ""
	            };
	            var username = vmdata.User;
		    var mac = vmdata.MAC;
	            shell.kill_vm(mac);
	            // URL of the Overseer host and an Brahma token with admin privs
	            api.updateUser(username, vm_data, function() {

	                //Remove vm data which is in database "brahma_website" collection "vm_model"
	                vm.remove_data("VM_" + vm_number, function() {
	                    res.redirect('/admin/vm');
	                });
	                    res.redirect('/admin/vm');
	            });
	        }
	    });
    });

    app.route('/admin/shutdown_vm/:vm_id').get(function(req,res){
        /*
	       Step:
	          1. Get VM data.
	          2. Use Resful API to update Overseer data.
	          3. Shutdown VM data.
	    */


	    var vm_number = req.params.vm_id;

	    //Get VM Data
	    var vm = vm_model();
	    var vm_data = {
	        "VM_ID": "VM_" + vm_number
	    }

	    var result = vm.get_data(vm_data, function(vmdata) {
	        if (vmdata == null) {
	            res.redirect('/admin/vm');
	        } else {
	            //Update Overseer Database Data
	            vm_data = {
	                "vm_id": "",
	                "vm_ip": ""
	            };
	            var username = vmdata.User;
		    var mac = vmdata.MAC;
	            shell.shutdown_vm(mac);
	            // URL of the Overseer host and an brahma token with admin privs
	            api.updateUser(username, vm_data);
	            res.redirect('/admin/vm');
	        }
	    });
    });

    app.route('/start_vm/:vm_id').get(function(req,res){
    	/*
	       Step:
	          1. Get VM data.
	          2. Start VM.
	    */
	    var vm_number = req.params.vm_id;

	    //Get VM Data
	    var vm = vm_model();
	    var vm_data = {
	        "VM_ID": "VM_" + vm_number
	    }

	    var result = vm.get_data(vm_data, function(vmdata) {
	        if (vmdata == null) {
	            res.redirect('/admin/vm');
	        } else {
	            //Update Overseer Database Data
		    var vmId = vmdata.VM_ID;
	            shell.start_vm(vmId);
	            res.redirect('/admin/vm');
	        }
	    });
    });


    //========================================
    //  line 514-543  area (get /arm)
    //========================================


    app.route('/admin/power_on_instance/:vm_id').get(function(req,res){
    	var vm_number = req.params.vm_id;
	    shell.power_on_instance(vm_number);
	    sleep.sleep(1);
	    res.redirect('/admin/arm');
    });

    app.route('/admin/power_off_instance/:vm_id').get(function(req,res){
    	var vm_number = req.params.vm_id;
	    shell.power_off_instance(vm_number);
	    sleep.sleep(1);
	    res.redirect('/admin/arm');
    });


	/*------------------------- Images --------------------*/
	app.route('/admin/images').get(function(req,res){
    	res.render('admin/images');
    });

    app.route('/admin/upload_images').get(function(req,res){
    	res.render('admin/upload_images');
    });


    /*------------------------- Server --------------------*/
    app.route('/admin/server_dashboard').get(function(req,res){
    	res.render('admin/server_dashboard');
    });

    app.route('/admin/operate_server/:operate').get(function(req,res){
    	var username = req.session.username;
   		var roles = req.session.roles;
    	var ip = req.connection.remoteAddress;
    	var ipAddress = ip.replace(/(^\D*)/g,"");

    	switch (req.params.operate) {
        case "run":

            /*
              Step:
                1. Clear all VM data.
                2. Use shell script run Brahma Server.
            */

            // Delete all data which is in database "brahma_website" collection "vm_model"
            //var vm = vm_model() ;
            //vm.remove_all_data() ;    

            // Use shell script to run Brahma Server
            var webLog_data = {
		        "user": username,
		        "roles": roles,
		        "action": "run server",
		        "ipAddress": ipAddress,
		        "message": username + " run Brahma server"
		    }
		    webLog.addWebPortalLog(webLog_data);
		    
            shell.run_server("server");
	    logger.info("Admin start VMI overseer services");
            res.render('admin/vmi_server_detail', {
                status: "RUN",
                localIP: local.ip,
                port: local.server_port
            });

            //res.render('admin/vmi_server_detail',{status:"RUN",Message:"Server is running now!!" });
            break;

        case "stop":
            /*
              Step:
                1. Get Brahma Server PID
                2. Use shell script to kill Brahma Server Process
            */

            // Get Brahma Serve process pid
            //shell.get_pid('server',function(pid){
            //  console.log(pid) ;
            // kill Brahma Server process
            //  shell.stop_server(pid) ;
            //}) ;
            //res.render('admin/vmi_server_detail',{ status:"NotRUN",Message:'Server stop !!' });
            var webLog_data = {
		        "user": username,
		        "roles": roles,
		        "action": "stop server",
		        "ipAddress": ipAddress,
		        "message": username + " stop Brahma server"
		    }
		    webLog.addWebPortalLog(webLog_data);
		    
            shell.stop_server("server");
	    logger.info("Admin stop VMI overseer services");
            //  }) ;
            res.render('admin/vmi_server_detail', {
                status: "NotRUN",
                localIP: local.ip,
                port: local.server_port
            });
           

            break;

        case "restart":
            /*
              Step:
                1. Remove all VM Data
                2. Get Brahma Server Process PID
                3. Kill Brahma Server Process
                4. Use shell script to run Brahma Server
            */

            //Remove all VM Data 
            //var vm = vm_model() ;
            //vm.remove_all_data() ;   

            //get Brahma Server process pID
            //shell.get_pid('server',function(pid){
            //  console.log(pid) ;
            //kill Brahma Server process
            var webLog_data = {
		        "user": username,
		        "roles": roles,
		        "action": "restart server",
		        "ipAddress": ipAddress,
		        "message": username + " restart Brahma server"
		    }
		    webLog.addWebPortalLog(webLog_data);
		    
            shell.stop_server("server");
	    logger.info("Admin restart VMI overseer services");
            //}) ;
            // Run Brahma Server
            shell.run_server("server");
            res.render('admin/vmi_server_detail', {
                status: "RUN",
                localIP: local.ip,
                port: local.server_port
            });
            
            //res.render('admin/vmi_server_detail',{status:"RUN",Message:'Server restart!!' });

            break;
    	}
    });

    app.route('/admin/operate_overseer/:operate').get(function(req,res){
    	var username = req.session.username;
   		var roles = req.session.roles;
    	var ip = req.connection.remoteAddress;
    	var ipAddress = ip.replace(/(^\D*)/g,"");
    	switch (req.params.operate) {
        case "run":

            /*
          Step:
            1. Clear all VM data.
            2. Use shell script run Brahma Overseer.
        */

            // Delete all data which is in database "brahma_website" collection "vm_model"     
            //var vm = vm_model() ;
            //vm.remove_all_data() ;

            // Run Brahma Overseer
            var webLog_data = {
		        "user": username,
		        "roles": roles,
		        "action": "run overseer",
		        "ipAddress": ipAddress,
		        "message": username + " run Brahma overseer"
		    }
		    webLog.addWebPortalLog(webLog_data);
		    
            shell.run_server('overseer');
	    logger.info("Admin start VMI server services");
            res.render('admin/vmi_overseer_detail', {
                status: "RUN",
                localIP: local.ip,
                port: local.over_port
            });

            //        res.render('admin/vmi_overseer_detail',{ status:data, localIP:local.ip, port:local.over_port, Message: "Overseer is running now!!" });
            //res.render('admin/vmi_overseer_detail',{status:"RUN",Message:'Server is running now!!' });

            break;

        case "stop":
            /*
              Step:
                1. Get Brahma Overseer PID
                2. Use shell script to kill Brahma Overseer Process
            */

            //get Brahma Overseer process pid
            //shell.get_pid('overseer',function(pid){
            //   console.log(pid) ;

            //kill Brahma Overseer process
            var webLog_data = {
		        "user": username,
		        "roles": roles,
		        "action": "stop overseer",
		        "ipAddress": ipAddress,
		        "message": username + " stop Brahma overseer"
		    }
		    webLog.addWebPortalLog(webLog_data);
		    
            shell.stop_server("overseer");
	    logger.info("Admin stop VMI server services");
            //  }) ;
            res.render('admin/vmi_overseer_detail', {
                status: "NotRUN",
                localIP: local.ip,
                port: local.over_port
            });

            //res.render('admin/vmi_overseer_detail',{status:"NotRUN",Message:'Server stop!!' });

            break;

        case "restart":

            /*
               Step:
                 1. Remove all VM Data
                 2. Get Brahma Overseer Process PID
                 3. Kill Brahma Overseer Process
                 4. Use shell script to run Brahma Overseer
            */

            //Delete all VM Data which is in database "brahma_website" collcetion "vm_model"
            //var vm = vm_model() ;
            //vm.remove_all_data() ;  


            //get Brahma Overseer process pid
            //shell.get_pid('overseer',function(pid){
            //  console.log(pid) ;
            //kill Brahma Overseer process
            var webLog_data = {
		        "user": username,
		        "roles": roles,
		        "action": "restart overseer",
		        "ipAddress": ipAddress,
		        "message": username + " restart Brahma overseer"
		    }
		    webLog.addWebPortalLog(webLog_data);
            shell.stop_server("overseer");
	    logger.info("Admin restart VMI server services");
            //}) ;
            //Run Brahma Overseer
            shell.run_server("overseer");
            res.render('admin/vmi_overseer_detail', {
                status: "RUN",
                localIP: local.ip,
                port: local.over_port
            });

            //res.render('admin/vmi_overseer_detail',{ status:"RUN",Message:'Server restart !!' });

            break;
    	}
    });

    app.route('/admin/reset_config/:choice').get(function(req,res){
    	    /*
	         Step:
	           Copy default configure file to exist one
	    	*/

	    switch (req.params.choice) {
	        case "overseer":

	            //Use bash to copy default configure file to cover exist one
	            shell.copy_config_file(req.params.choice);
	            res.render('admin/vmi_overseer_detail', {
	                status: "RUN",
	                Message: 'Configure file has reset !!'
	            });

	            break;
	        case "server":

	            //Use bash to copy default configure file to cover exist one

	            shell.copy_config_file(req.params.choice);
	            res.render('admin/vmi_server_detail', {
	                status: "RUN",
	                Message: 'Configure file has reset !!'
	            });
	            break;
	        default:
	            res.redirect('/admin/server_dashboard');
	            break;
	    }
    });

    app.route('/admin/vmi_overseer_detail').get(function(req,res){
    	//use shell script check a overseer process is alive or not ?
	    //console.log(response);
        var username = req.session.username;
    	var roles = req.session.roles;
    	var ip = req.connection.remoteAddress;
    	var ipAddress = ip.replace(/(^\D*)/g,"");
	    var webLog_data = {
	        "user": username,
	        "roles": roles,
	        "action": "visit",
	        "ipAddress": ipAddress,
	        "message": username + " visit page - vmi_overseer_detail"
	    }
	    webLog.addWebPortalLog(webLog_data);

		shell.check_run('overseer', function(data) {
	        //res.render('admin/vmi_overseer_detail',{ status:data, localIP:local.ip, port:local.over_port });
		data = data.trim();
	        if (data === 'RUN') {
	            res.render('admin/vmi_overseer_detail', {
	                status: "RUN",
	                localIP: local.ip,
	                port: local.over_port
	            });
	        } else {
	            res.render('admin/vmi_overseer_detail', {
	                status: "NotRUN",
	                localIP: local.ip,
	                port: local.over_port
	            });
	        }
	    });
    });

    app.route('/admin/vmi_server_detail').get(function(req,res){
	   	//use shell script check a server process is alive or not ?
	   	var username = req.session.username;
    	var roles = req.session.roles;
    	var ip = req.connection.remoteAddress;
    	var ipAddress = ip.replace(/(^\D*)/g,"");
	    var webLog_data = {
	        "user": username,
	        "roles": roles,
	        "action": "visit",
	        "ipAddress": ipAddress,
	        "message": username + " visit page - vmi_server_detail"
	    }
	    webLog.addWebPortalLog(webLog_data);

		shell.check_run('server', function(data) {
		data = data.trim();
	        if (data == "RUN") {
	            res.render('admin/vmi_server_detail', {
	                status: "RUN",
	                localIP: local.ip,
	                port: local.server_port
	            });
	        } else {
	            res.render('admin/vmi_server_detail', {
	                status: "NotRUN",
	                localIP: local.ip,
	                port: local.server_port
	            });
	        }
	    });
    });

 	app.route('/admin/vmi_server_setting').get(function(req,res){
 		
 		network.get_active_interface(function(err, obj){
 			var jsonIP = {
	 			ip: obj.ip_address,
	 			netmask: obj.netmask,
	 			gateway: obj.gateway_ip
	 		}
	 		
		    var ip = req.connection.remoteAddress;
		    var ipAddress = ip.replace(/(^\D*)/g,"");
	 		var username = req.session.username;
		    var roles = req.session.roles;
			var webLog_data = {
			    "user": username,
			    "roles": roles,
		        "action": "visit",
		        "ipAddress": ipAddress,
		        "message": username + " visit page - vmi_server_setting"
		    }
		    webLog.addWebPortalLog(webLog_data);
			res.render('admin/vmi_server_setting',{data:jsonIP});
 		}); 		
    });

 	app.route('/admin/server_setting').post(function(req,res){
    	var ip = req.body.ip;
    	var netmask = req.body.netmask;
    	var gateway = req.body.gateway;
    	var ipRule = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    	var ipRegex = ip.match(ipRule);
    	var maskRegex = netmask.match(ipRule);
    	var gateRegex = gateway.match(ipRule);
    	if(!ipRegex || ipRegex[1]>255 || ipRegex[2]>255 || ipRegex[3]>255 || ipRegex[4]>255){
    		res.json({msg:"IP does not match the correct format"});
    	}else if(!maskRegex || maskRegex[1]>255 || maskRegex[2]>255 || maskRegex[3]>255 || maskRegex[4]>255){
    		res.json({msg:"Netmask does not match the correct format"});
    	}else if(!gateRegex || gateRegex[1]>255 || gateRegex[2]>255 || gateRegex[3]>255 || gateRegex[4]>255){
    		res.json({msg:"Gateway does not match the correct format"});
    	}else{
    		var username = req.session.username;
	    	var roles = req.session.roles;
	    	var ip = req.connection.remoteAddress;
	    	var ipAddress = ip.replace(/(^\D*)/g,"");
		    var webLog_data = {
		        "user": username,
		        "roles": roles,
		        "action": "server setting",
		        "ipAddress": ipAddress,
		        "message": username + " set Server IP , Netmask , Gateway , DNS"
		    }
		    webLog.addWebPortalLog(webLog_data);
	   		res.redirect('/admin/vm');
    	}    	
    });


    /*------------------------- Department and User ---------------*/
	app.route('/admin/show_department_auth_app').get(function(req,res){
	    	res.render('admin/show_department_auth_app');
    });


	app.route('/admin/create_user').get(function(req,res){
		//use Resful API to get all device type
		var username = req.session.username;
    	var roles = req.session.roles;
    	var ip = req.connection.remoteAddress;
    	var ipAddress = ip.replace(/(^\D*)/g,"");
	    var webLog_data = {
	        "user": username,
	        "roles": roles,
	        "action": "visit",
	        "ipAddress": ipAddress,
	        "message": username + " visit page - create user"
	    }
	    webLog.addWebPortalLog(webLog_data);
	    
		api.listDevices(function(error, result) {
	        res.render('admin/create_user', {
	            device_type: result.body
	        });
	        // res.send(result.body) ;
	    });
    });

	app.route('/admin/create_user').post(function(req,res){
	    /*
	       Step:
	         1. Create new user
	         2. Force Change 'approved' to true and 'password_change_needed' to false
	    */

	    var username = req.body.username;
	    var password = req.body.password;
	    var email = req.body.email;
	    var device_type = req.body.device_type;

    	var ip = req.connection.remoteAddress;
    	var ipAddress = ip.replace(/(^\D*)/g,"");
	    var sessionUser = req.session.username;
    	var roles = req.session.roles;
	    var webLog_data = {
	        "user": sessionUser,
	        "roles": roles,
	        "action": "add user",
	        "ipAddress": ipAddress,
	        "message": sessionUser + " add user - " + username
	    }
	    webLog.addWebPortalLog(webLog_data);
	    
		// var api = new client(overseer_url+'/services/user',token);
	    // use Resful API to create a Brahma user
	    api.createUser(username, password, email, device_type, function(err, result) {
	        if (err) console.log(err);
	        else {
	        	 brahma.User.find({username: username})
			        .select('username email_id')
			        .exec(function (err, results) {
			            if (err) {
			                logger.info("take email_id err: "+ err);
			            } else {
			            	logger.info("Create user "+ username);

			            	var email_id = results[0].email_id;
			            	var mailUrl = brahma.config.get("rest_server_url") + "/accountVerify/"+ email_id ;
				        	var mailText = "Please confirm your account by clicking the following link:" + mailUrl;
				        	mail.sendToUser(email,mailText);

				        	res.redirect('/admin/show_user');
			            }
			        });
	            // use Resful API to update Brahma user data 
	            /*var user_changed_data = {
                    "approved": "true",
                    "password_change_needed": "false"
                }*/
                // var api = new client(overseer_url+'/services/user/'+username,token);          
	            /*api.updateUser(username, user_changed_data, function() {
					logger.info("Create user "+username);
	                res.redirect('/admin/show_user');
	            });*/
	        }
	    });
    });

	app.route('/admin/show_user').get(function(req,res){
		var username = req.session.username;
    	var roles = req.session.roles;
    	var ip = req.connection.remoteAddress;
    	var ipAddress = ip.replace(/(^\D*)/g,"");
    	var webLog_data = {
	        "user": username,
	        "roles": roles,
	        "action": "visit",
	        "ipAddress": ipAddress,
	        "message": username + " visit page - user"
	    }
	    webLog.addWebPortalLog(webLog_data);
	    res.render('admin/show_user');				
    });

    app.route('/admin/show_user_table').post(function(req,res){
    	api.listUsers(function(err, result) {
	        if ( typeof result === 'undefined' ) {
	            var users = [];
	            res.render('admin/show_user_table', {
	                all_users_data: users
	            });
	        } else {
	            var users = result.body.users;
	            res.render('admin/show_user_table', {
	                all_users_data: users
	            });
	        }
	    });
    });

    app.route('/admin/delete_user/:username').get(function(req,res){
    	var username = req.params.username;
    	
    	var sessionUser = req.session.username;
    	var roles = req.session.roles;
    	var ip = req.connection.remoteAddress;
    	var ipAddress = ip.replace(/(^\D*)/g,"");
	    var webLog_data = {
	        "user": sessionUser,
	        "roles": roles,
	        "action": "delete user",
	        "ipAddress": ipAddress,
	        "message": sessionUser + " delete user - " + username
	    }
	    webLog.addWebPortalLog(webLog_data);
	    
		brahma.logger.info("username is " + username);
    	api.deleteUser(username, function(err, result) {
	        res.redirect('/admin/show_user');
	    }); 
    });

    app.route('/admin/show_user_auth_app').get(function(req,res){
    	res.render('admin/show_user_auth_app');
    });

/*------------------------- Secure Viewer and Meeting room ---------------*/

   app.route('/admin/show_meeting').get(function(req,res){
	//var meetingModel = require("../../model/meetinginfo_model");


	var meetingModel = require("../controllers/meetingRoom");

	meetingModel.get_all_data(function(data){
		res.render('admin/show_meeting',{data:data});
	});
  
 });

   app.route('/admin/create_meeting').get(function(req,res){
   	brahma.User.find({roles: 'developer'}).select("username").exec(function (err, results) {
        	if (err) throw err;

        	if (!results.length) {
        		var data = [];
        	} else {
        		var data = results;
        	}
        	res.render('admin/create_meeting',{data:data});
    	});
   });

   app.route('/admin/create_meeting').post(function(req,res){
	var meetingModel = require("../../model/meetinginfo_model");

	var period = req.body.period;
	var date = period.split(" ");
	var startDate = date[0];
	var endDate = date[2];

	var now = Date.now().toString().substr(7);
	var no = Math.floor(Math.random()*900)+100;
	var meetingID = now + no.toString();
	var data = {
		meetingID : meetingID,
		meetingName : req.body.meetingName,
		hostID : req.body.hostID,
		hostPW : req.body.hostPW,
		startDate : startDate,
		endDate : endDate
	}

	new meetingModel(data).save(function(err) {
            if(err) throw err;
            var path = "/opt/NFS/" + meetingID;
	    child_process.exec(script_folder_path + "nfsManage.sh \""+ "add" +"\" \"" + meetingID + "\"",function(stderr,stdout,err){
      		if (err) {
         		console.log("add meeting err: "+err);
      		} else {
      		   	var statusCode = stdout.trim();
			console.log("[DEBUG] stdout = " + statusCode);
         		if ( statusCode == "0" || statusCode == "Done") {
           			res.redirect('/admin/show_meeting');
         		} else {
         		
			}
      		
		}
	    });
        });
    });

    app.route('/admin/delete_meeting/:meetingID').get(function(req,res){
	var meetingModel = require("../../model/meetinginfo_model");
	var meetingID = req.params.meetingID;
        var path = "/opt/NFS/" + meetingID;
	child_process.exec(script_folder_path + "nfsManage.sh \"" + "remove" +"\" \"" + meetingID + "\"",function(stderr,stdout,err){
		if(err){
			console.log("delete meeting err: " + err);
		}else{
			var statusCode = stdout.trim();
			console.log("[DEBUG] stdout = " + statusCode);
			if (statusCode == "0" || statusCode == "Done"){
				meetingModel.remove({"meetingID":meetingID},function(err, result){
					if(err) throw err;
                			fileModel.remove({"meetingID":meetingID},function(err, result){
                				if(err) throw err; 
                				res.redirect('/admin/show_meeting');
                			});
				});
			}
		}
	});
    });
};
