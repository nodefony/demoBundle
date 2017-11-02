module.exports = {
  indexReal: {
    pattern: "/demo/realtime",
    defaults: {
      controller: "demoBundle:demo:indexRealTime"
    },
    requirements: {
      method: "GET"
    }
  }
};
