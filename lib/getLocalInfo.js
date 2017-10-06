'use strict';

var os = require('os');
var ifaces = os.networkInterfaces();
var ip;

Object.keys(ifaces).forEach(function (ifname) {

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }
      //console.log(iface.address);
      ip = iface.address;
  });
});

// TODO: Implement overseer and server config checker
var overseer_port = "3000";
var server_port = "8080";
exports.ip = ip;
exports.over_port= overseer_port;
exports.server_port= server_port;
