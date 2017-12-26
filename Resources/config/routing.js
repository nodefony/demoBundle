// ROUTING
const orm = require("./routing/orm.js");
const login = require("./routing/login.js");
const upload = require("./routing/upload.js");
const firewall = require("./routing/firewall.js");
const finder = require("./routing/finder.js");
const websocket = require("./routing/websocket.js");
const realtime = require("./routing/realtime.js");
const webaudio = require("./routing/webaudio.js");

module.exports = nodefony.extend(orm, login, upload, firewall, finder, websocket, realtime, webaudio, {

  redirect: {
    pattern: "/redirect",
    defaults: {
      controller: "demoBundle:demo:redirectGoogle"
    }
  },
  json: {
    pattern: "/json",
    defaults: {
      controller: "demoBundle:demo:json"
    }
  }
});