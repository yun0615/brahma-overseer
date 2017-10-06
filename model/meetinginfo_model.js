var mongoose = require('mongoose') ;
var Schema = mongoose.Schema ;

//create meeting table 
var meetinginfo_model =  new Schema({
	meetingID:String,
	meetingName:String,
	hostID:String,
	startDate:String,
	endDate:String,
	createTime:{
		type: Date,
		default: Date.now
   	 },
    	status:{
    		type: String,
    		default: ""
    	}
});
meetinginfo_model.methods.insert_data  =function(data,callback){
	new meetinginfo_model(data).save(function(err){
		if(err) throw err ;
	});
};

meetinginfo_model.methods.get_data = function(data, callback){
		
	var query = meetinginfo_model.findOne(data) ;
	query.select('') ; // '' means get all filed
	query.exec(function(err,data){
		if(err) throw err ;
			callback(data) ;
	});	
};

meetinginfo_model.methods.get_all_data = function(callback){
	var query = meetinginfo_model.find() ;
	query.select('') ;
	query.exec(function(err,data){
		if(err) throw err ;
		callback(data) ;
	});

}
meetinginfo_model.methods.update_data = function(vm_id,update_data,callback){
	var option = null; 
	meetinginfo_model.update({'VM_ID':vm_id},update_data,option,callback) ;

};


meetinginfo_model.methods.remove_all_data = function(callback){
	var option = null; 
	meetinginfo_model.find().remove().exec() ;
};

meetinginfo_model.methods.remove_data = function(data,callback){
	var option = null; 
	meetinginfo_model.findOne({"VM_ID":data}).remove().exec() ;

};



//Declare this file become a model 

//define an Actor model with this mongooose instance
mongoose.model('meetinginfo',meetinginfo_model);

//create a new connection
var conn = mongoose.createConnection("mongodb://localhost/secure_viewer");

//retrieve the Actor model
var meetinginfo_model = conn.model('meetinginfo');

module.exports = meetinginfo_model ;


