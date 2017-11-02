module.exports = {
  finder: {
    pattern: "/finder",
    defaults: {
      controller: "demoBundle:finder:index"
    }
  },
  download: {
    pattern: "/download",
    defaults: {
      controller: "demoBundle:finder:download"
    },
    requirements: {
      method: "GET"
    }
  }
};
