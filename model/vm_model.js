var mongoose = require('mongoose') ;
var Schema = mongoose.Schema ;

//create user table 
var vm_model =  new Schema({
	VM_ID:String,
	IP:String,
	MAC:String,
	PID:Number,
	User:String,
	Status:String
});

vm_model.methods.insert_data  =function(data,callback){
	data.save(function(err){
		if(err) throw err ;
	});
};


vm_model.methods.get_data = function(data, callback){
		
	var query = vm_model.findOne(data) ;
	query.select('') ; // '' means get all filed
	query.exec(function(err,data){
		if(err) throw err ;
			callback(data) ;
	});	
};

vm_model.methods.get_all_data = function(callback){
	var query = vm_model.find() ;
	query.select('') ;
	query.exec(function(err,data){
		if(err) throw err ;
		callback(data) ;
	});

}
vm_model.methods.update_data = function(vm_id,update_data,callback){
	var option = null; 
	vm_model.update({'VM_ID':vm_id},update_data,option,callback) ;

};


vm_model.methods.remove_all_data = function(callback){
	var option = null; 
	vm_model.find().remove().exec() ;
};

vm_model.methods.remove_data = function(data,callback){
	var option = null; 
	vm_model.findOne({"VM_ID":data}).remove().exec() ;

};



//Declare this file become a model 
var vm_model = mongoose.model('vm_model',vm_model) ;
mongoose.Promise = global.Promise;
mongoose.createConnection('mongodb://localhost/brahma_website') ; //create database named testsystem
module.exports = vm_model ;


