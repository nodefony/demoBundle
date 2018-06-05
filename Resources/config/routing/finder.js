module.exports = {
  finder: {
    pattern: "/finder",
    defaults: {
      controller: "demo:finder:index"
    }
  },
  download: {
    pattern: "/download",
    defaults: {
      controller: "demo:finder:download"
    },
    requirements: {
      method: "GET"
    }
  }
};