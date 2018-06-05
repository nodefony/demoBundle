module.exports = {
  // ###  LOGIN LOGOUT AND CREATE ACCOUNT   ###
  loginAll: {
    pattern: "/demo/login/{type}",
    defaults: {
      controller: "demo:login:login"
    }
  },
  demoLogout: {
    pattern: "/logout",
    defaults: {
      controller: "demo:logout:logout"
    }
  },
  subscribe: {
    pattern: "/subscribe",
    defaults: {
      controller: "demo:login:subscribe"
    }
  },
  adduser: {
    pattern: "/adduser",
    defaults: {
      controller: "demo:login:addUser"
    },
    requirements: {
      method: "POST"
    }
  }
};