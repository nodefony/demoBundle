module.exports = {
  orm: {
    pattern: "/sequelize",
    defaults: {
      controller: "demo:orm:sequelize"
    },
    requirements: {
      method: "GET"
    }
  },
  sql: {
    pattern: "/query/sql",
    defaults: {
      controller: "demo:orm:querySql"
    },
    requirements: {
      method: "GET"
    }
  },
  sqlJoin: {
    pattern: "/query/join",
    defaults: {
      controller: "demo:orm:querySqlJoin"
    },
    requirements: {
      method: "GET"
    }
  }
};