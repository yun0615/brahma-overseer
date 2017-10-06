var meetingModel = require('../../model/meetinginfo_model');
var logger = require('../../lib/logger');
var moment = require('moment');

exports.signinID = function(req, res){

    var roomID = req.body.roomID;
    

    meetingModel.findOne({meetingID: roomID,status:''},function(err, results){
       if(err){
           res.json(401,{msg:'fail signin'});
       }

       if(results){
	   var startDate = moment(results.startDate);
	   var now = moment();
	   if(now > startDate){
		res.json(200,{msg:'success signin'});
	   }else{
		res.json(200,{msg:'fail signin'});
	   }
       }else{
           res.json(200,{msg:'fail signin'});
       }
    });

};


exports.get_all_data = function(callback){
    var query = meetingModel.find().sort({createTime:-1});
    query.select("");
    query.exec(function(err,data){
        if(err) throw err;
        callback(data);
    });
};

exports.get_data = function(data, callback){
    var query = meetingModel.find(data) ;
    query.select('') ; // '' means get all filed
    query.exec(function(err,data){
        if(err) throw err ;
        if(!data.length){
          data = [];
        }
        return data ;
    }); 
};


