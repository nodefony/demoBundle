module.exports = {
  websocket: {
    pattern: "/websocket",
    defaults: {
      controller: "demoBundle:websocket:websocket"
    },
    requirements: {
      method: ["GET", "WEBSOCKET"]
    }
  }
};
