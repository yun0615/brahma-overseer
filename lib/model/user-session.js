/*
 * Copyright 2014 The MITRE Corporation, All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this work except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * author Tails Chi #14502
 *
 */
'use strict';

module.exports = UserSessionModel;

/**
 *  Define the User Session Model Schema.
 *
 */
function UserSessionModel(mongoose) {

    // Schema definition
    var UserSessionSchema = new mongoose.Schema({
        content: {
            type: String,
            //unique: true,
            required: true
        },
        lastAction: {
            type: String
        }

    });

    return mongoose.model('UserSession', UserSessionSchema);
};
