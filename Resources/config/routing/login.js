module.exports = {
  // ###  LOGIN LOGOUT AND CREATE ACCOUNT   ###
  loginAll: {
    pattern: "/demo/login/{type}",
    defaults: {
      controller: "demoBundle:login:login"
    }
  },
  demoLogout: {
    pattern: "/logout",
    defaults: {
      controller: "securityBundle:logout:logout"
    }
  },
  subscribe: {
    pattern: "/subscribe",
    defaults: {
      controller: "demoBundle:login:subscribe"
    }
  },
  adduser: {
    pattern: "/adduser",
    defaults: {
      controller: "demoBundle:login:addUser"
    },
    requirements: {
      method: "POST"
    }
  }
};