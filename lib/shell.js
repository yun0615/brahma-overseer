var exec = require('exec') ;
var child_process = require('child_process');
var path = require('path') ;
var fs = require('fs') ;
var project_path = "/root/brahma-project/" ;
var base_images = "back.img" ;

module.exports = {
	//-------------  Common --------------------
	check_run : function(choice,callback){
		var script_path = path.join(__dirname,'s_scripts/test_run.sh') ;
		 child_process.exec(script_path +" "+choice,function(stderr,stdout,err){
console.log("std err: "+ stderr);
console.log("std out: "+ stdout);
console.log("std err2: " + err);

			callback(stdout) ;
		}) ;

	},
	//---------------- Operate Server -----------------
	run_server : function(choice){
		//var script_path = path.join(__dirname,'s_scripts/brahma'+choice+'/run_server.sh') ;
		//child_process.exec('bash ' + script_path) ;
		var script_path = path.join(__dirname,'s_scripts/run_services.sh') ;
	          child_process.exec(script_path +" "+choice);
	},
	get_pid : function(choice,callback){
	  	var filepath ;
	    if(choice == "overseer")
	    	filepath =  project_path +'/brahma-overseer/overseer_pid.txt' ;
	    else
	    	filepath =  project_path + '/brahma-server/bin/server_pid.txt' ;

	    fs.readFile(filepath,function(err,data){
	    		if(err) console.log('read pid file error : ' + err) ;
	    		callback(data.toString()) ;	
	    })
	   
			
	},
	stop_server : function(choice){
		//child_process.exec('kill '+  pid,function(err){
		//		if(err)console.log(err) ;
		//}) ;
		var script_path = path.join(__dirname,'s_scripts/kill_services.sh') ;
	          child_process.exec(script_path +" "+choice);


	},
	copy_config_file : function(choice,callback){
		child_process.exec('cp -f '+ project_path+"/brahma-"+choice+"/config/_config.local.template.yaml " + project_path+"/brahma-"+choice+"/config/config-local.yaml" ) ;
	},
	//--------------- Virtual Machine -------------
	run_vm : function(macaddress,serial_number,callback){
		 var img_path = path.join(__dirname,'..','/img/'+base_images);
		 var vm_path =  path.join(__dirname,'..','/vm');
		 var script_path = path.join(__dirname,'s_scripts/vm/qemu_run_vm.sh') ;

		 //Copy New image from base image(anthony images)
		/*
		 child_process.exec('cp ' + img_path + " " + vm_path + "/VM_"+serial_number+".img",function(err){
				console.log("sh "+script_path+" "+macaddress+" "+vm_path+"/VM_"+serial_number+".img") ;
				if(err)console.log(err) ;
				console.log("Copy image complete") ;
				child_process.exec("sudo bash "+script_path+" "+macaddress+" "+vm_path+"/VM_"+serial_number+".img "+save_pid_path) ;
		}) ;
		*/
		//child_process.exec("sudo bash "+script_path+" "+macaddress+" "+vm_path+"/VM_"+serial_number+".img "+save_pid_path) ;
		child_process.exec("sudo bash " + script_path + " " + serial_number) ;
	},
	kill_vm : function(macaddress,callback){
		var script_path = path.join(__dirname,'s_scripts/vm/kill_vm.sh') ;
		child_process.exec("sudo bash " + script_path + " " + macaddress) ;
	},
	shutdown_vm : function(macaddress,callback){
		var script_path = path.join(__dirname,'s_scripts/vm/shutdown_vm.sh') ;
		child_process.exec("sudo bash " + script_path + " " + macaddress) ;
	},
	start_vm : function(vmId,callback){
		var script_path = path.join(__dirname,'s_scripts/vm/start_vm.sh') ;
		child_process.exec("sudo bash " + script_path + " " + vmId) ;
	},
	mac_tran_ip : function(macaddress,callback){
		var script_path = path.join(__dirname,'s_scripts/vm/show_ip.sh') ;
		child_process.exec("sh "+script_path+" "+macaddress,function(stderr,stdout,error){
			if(stderr) console.log(stderr) ;
			else callback(stdout) ;
		});
       },
	power_on_instance : function(vmId,callback){
		var script_path = path.join(__dirname,'s_scripts/arm/update_instance_status.sh') ;
		child_process.exec("sudo bash " + script_path + " on " + " " + vmId) ;
	},
	power_off_instance : function(vmId,callback){
		var script_path = path.join(__dirname,'s_scripts/arm/update_instance_status.sh') ;
		child_process.exec("sudo bash " + script_path + " off " + " " + vmId) ;
	},
       reset_board : function(ip,callback){
		var script_path = path.join(__dirname,'s_scripts/vm/reset_odroid.sh') ;
		child_process.exec("sudo bash " + script_path + " " + ip) ;
       },
};
