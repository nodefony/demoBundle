module.exports = {
  orm: {
    pattern: "/sequelize",
    defaults: {
      controller: "demoBundle:orm:sequelize"
    },
    requirements: {
      method: "GET"
    }
  },
  sql: {
    pattern: "/query/sql",
    defaults: {
      controller: "demoBundle:orm:querySql"
    },
    requirements: {
      method: "GET"
    }
  },
  sqlJoin: {
    pattern: "/query/join",
    defaults: {
      controller: "demoBundle:orm:querySqlJoin"
    },
    requirements: {
      method: "GET"
    }
  }
};
