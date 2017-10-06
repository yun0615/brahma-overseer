var mongoose = require('mongoose') ;

//declare a method for insert user data
proxyusers_model.methods.insert_data  =function(data){
	data.save(function(err){
		if(err) throw err ;
		 

	});
	
};


//declare a method for get user data by account and password 
proxyusers_mode.methods.get_user = function(data, callback){
		
	// var query = user.findOne(data) ;
	// query.select('') ; // '' means get all filed
	// query.exec(function(err,userdata){
	// 	if(err) throw err ;
	// 		callback(userdata) ;
	// });	
}

//declare a method for get all user data
proxyusers_mode.methods.get_all_data = function(callback){
	// var query = vm_model.find() ;
	// query.select('') ;
	// query.exec(function(err,data){
	// 	if(err) throw err ;
	// 	callback(data) ;
	// });


}
//update data
proxyusers_mode.methods.update_data = function(username,update_data,callback){
	proxyusers_mode.update({'username':username},update_data) ;
}






//Declare this file become a model 
var proxyusers_model = mongoose.model('proxyusers_model',proxyusers_model) ;

mongoose.connect('mongodb://localhost/brahma_overseer_production_db') ; //create database named testsystem
module.exports = proxyusers_model ;


