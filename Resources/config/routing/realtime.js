module.exports = {
  indexReal: {
    pattern: "/demo/realtime",
    defaults: {
      controller: "demo:demo:indexRealTime"
    },
    requirements: {
      method: "GET"
    }
  }
};