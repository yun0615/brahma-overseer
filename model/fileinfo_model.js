var mongoose = require('mongoose') ;
var Schema = mongoose.Schema ;

//create user table 
var fileinfo_model =  new Schema({
	meetingID:String,
	filename:String,
	filesize:String,
	startDate:String,
	endDate:String,
	createTime:{
	        type: Date,
       		default: Date.now
  	},
	status:{
		type: String,
		default:""
	}
});





//Declare this file become a model 

//define an Actor model with this mongooose instance
mongoose.model('fileinfo',fileinfo_model);

//create a new connection
var conn = mongoose.createConnection("mongodb://localhost/secure_viewer");

//retrieve the Actor model
var fileinfo_model = conn.model('fileinfo');

module.exports = fileinfo_model ;


