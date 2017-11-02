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
  // HOME
  demo: {
    pattern: "/home",
    defaults: {
      controller: "demoBundle:demo:index"
    }
  },
  syscall: {
    pattern: "/syscall",
    defaults: {
      controller: "demoBundle:demo:syscall"
    },
    requirements: {
      method: "GET"
    }
  },
  httpRequest: {
    pattern: "/httpRequest",
    defaults: {
      controller: "demoBundle:demo:httpRequest"
    },
    requirements: {
      method: "GET"
    }
  },
  xmlResponse: {
    pattern: "/xmlResponse",
    defaults: {
      controller: "demoBundle:demo:rawResponseSync"
    },
    requirements: {
      method: "GET"
    }
  },
  xmlAsyncResponse: {
    pattern: "/xmlAsyncResponse",
    defaults: {
      controller: "demoBundle:demo:rawResponseAsync"
    },
    requirements: {
      method: "GET"
    }
  },
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
