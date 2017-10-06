/*
 *
 * author yun
 *
 */
'use strict';

module.exports = appClientLogModel;

/**
 *  Define the appClientLog functionality and Schema.
 *
 */
function appClientLogModel(mongoose) {

    var Schema = mongoose.Schema;
    // Validation helpers

    // Schema definition
    var appClientLogSchema = new Schema({
        username: {
            type: String,
            required: true
        },
        ipAddress: {
            type: String,
            default: ''
        },
        device: {
            type: String,
            default: ''
        },
	os: {
	    type: String,
            default:''
        },
        message: {
            type: String,
            default: ''
        },
        time: {
            type: Date,
            default: Date.now
        }
    });
    
    return mongoose.model('appClientLog', appClientLogSchema);
}
