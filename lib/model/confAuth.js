'use strict';

module.exports = confAuthModel;

function confAuthModel(mongoose) {

    var Schema = mongoose.Schema;
    // Validation helpers

    // Schema definition
    var confAuthSchema =  new Schema({
        roomID:{
            type: String,
            unique: true,
            index: true,
            required: true
        },
        password:{
            type: String,
            default: ''
        },
        // When account created
        created: {
            type: Date,
            default: Date.now
        }
    });
    
    return mongoose.model('confAuth', confAuthSchema);
}