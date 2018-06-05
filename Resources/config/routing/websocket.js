module.exports = {
  websocket: {
    pattern: "/websocket",
    defaults: {
      controller: "demo:websocket:websocket"
    },
    requirements: {
      method: ["GET", "WEBSOCKET"]
    }
  }
};