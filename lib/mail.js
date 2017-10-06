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
 * author Dave Bryson
 *
 */
'use strict';

var
    brahma = require('./brahma'),
    smtpTransport = require('nodemailer').createTransport("SMTP", {
        host: brahma.config.get("smtp:host"),
        port: brahma.config.get("smtp:port"),
        secureConnection: brahma.config.get("smtp:secure_connection"),
        auth: {
            user: brahma.config.get("smtp:username"),
            pass: brahma.config.get("smtp:password")
        }
    });

/**
 * Helper to send the mail...
 * @param options
 */
function mailIt(options) {
    /**
     * We only send email if the host field is defined
     */
    if (brahma.config.get("smtp:host")) {
        smtpTransport.sendMail(options, function (error, responseStatus) {
            if (error) {
                console.log("Error sending email to user: ", error);
            }
        });
    }
}

/**
 * Send mail to the User (usually on a 'signup' an account approval)
 * @param email
 */
exports.sendToUser = function (email,text) {
    var opts = {
        from: 'yun0615@itri.org.tw', // sender address
        to: email, // list of receivers
        subject: "ITRI APPortal Account Approved",
        text: text
    };
    mailIt(opts);
};

/**
 *  Send email to admin as set on the config file.  Usually sent when a user signs up
 */
exports.sendToAdmin = function () {
    var opts = {
        from: 'yun0615@itri.org.tw', // sender address
        to: brahma.config.get("smtp:admin_email"),
        subject: "APPortal: Pending user account",
        text: "A User has registered with APPortal. Please check the APPortal admin console for pending APPortal accounts"
    };
    mailIt(opts);
};
