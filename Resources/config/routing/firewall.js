module.exports = {
  // ROUTE SECURE  FIRWALL AREAS ###

  // SASL AREA
  demoSecure: {
    pattern: "/demo/secure",
    defaults: {
      controller: "framework:default:401"
    }
  },

  // LOCAL AREA
  localArea: {
    pattern: "/local",
    defaults: {
      controller: "framework:default:401"
    }
  },
  // BASIC AREA
  basicArea: {
    pattern: "/basic",
    defaults: {
      controller: "framework:default:401"
    }
  },
  // DIGEST AREA
  digestArea: {
    pattern: "/digest",
    defaults: {
      controller: "framework:default:401"
    }
  },
  // GOOGLE AUTH AREA
  googleArea: {
    pattern: "/auth/google",
    defaults: {
      controller: "framework:default:401"
    }
  },
  googleCallBackArea: {
    pattern: "/auth/google/callback",
    defaults: {
      controller: "framework:default:401"
    }
  },
  // GITHUB AUTH AREA
  githubArea: {
    pattern: "/auth/github",
    defaults: {
      controller: "framework:default:401"
    }
  },
  githubCallBackArea: {
    pattern: "/auth/github/callback",
    defaults: {
      controller: "framework:default:401"
    }
  }
};
