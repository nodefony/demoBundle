const stage = require("@nodefony/stage");
require("bootstrap");
require('bootstrap/dist/css/bootstrap.css');
require('font-awesome/css/font-awesome.css');

require("../plugins/gritter/js/jquery.gritter.js");

//css
require('../clean/css/style.css');
require('../plugins/gritter/css/jquery.gritter.css');

// import base library
const nodefony = require('nodefony-client')
//chunk
const socket = require("nodefony-client/src/transports/socket/socket");
socket.default(nodefony);
const webaudio = require("nodefony-client/src/medias/webaudio/webaudio");
webaudio.default(nodefony);
const media = require("nodefony-client/src/medias/medias");
media.default(nodefony);

module.exports = function () {
  // expose stage in gobal window object
  window.stage = stage;
  window.nodefony = nodefony;
}();
