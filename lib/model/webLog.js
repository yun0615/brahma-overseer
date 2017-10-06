/*
 *
 * author yun
 *
 */
'use strict';

module.exports = webLogModel;

/**
 *  Define the webPortalLog functionality and Schema.
 *
 */
function webLogModel(mongoose) {

    var Schema = mongoose.Schema;
    // Validation helpers

    // Schema definition
    var webLogSchema = new Schema({
        // Username. Must be unique
        user: {
            type: String,
            required: true
        },
        roles: {
            type: String
        },
        ipAddress: {
            type: String,
            default: ''
        },
        action: {
            type: String,
            default: ''
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
    
    return mongoose.model('webLog', webLogSchema);
}
