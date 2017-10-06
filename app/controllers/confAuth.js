var brahma = require('../../lib/brahma');
var logger = require('../../lib/logger');

exports.confSignin = function(req, res){
logger.silly("Enter");
    var roomID = req.body.roomID;
    var password = req.body.password;


    brahma.confAuth.findOne({roomID: roomID,password: password},function(err, results){
       if(err){
           res.json(401,{msg:'fail signin'});
       }
       if(results){
           res.json(200,{msg:'success signin'});
       }else{
           res.json(200,{msg:'fail signin'});
       }
    });

};
