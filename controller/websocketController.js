module.exports = class websocketController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
  }

  /**
   *
   *	DEMO WEBSOCKET
   */
  websocketAction(message) {
    switch (this.getMethod()) {
    case "GET":
      let server = null;
      switch (this.context.protocol) {
      case "http":
        server = this.get("httpServer");
        break;
      case "https":
        server = this.get("httpsServer");
        break;
      }
      return this.render('demoBundle:websocket:websocket.html.twig', {
        name: "websoket",
        host: server.domain + ":" + server.port
      });
    case "WEBSOCKET":
      if (message) {
        // MESSAGES CLIENT
        this.logger(message.utf8Data, "INFO");
      } else {
        // PREPARE  PUSH MESSAGES SERVER
        // SEND MESSAGES TO CLIENTS
        let i = 0;
        let id = setInterval(() => {
          let mess = "I am a  message " + i + "\n";
          this.logger("SEND TO CLIENT :" + mess, "INFO");
          //this.context.send(mess);
          this.renderResponse(mess);
          i++;
        }, 1000);
        setTimeout(() => {
          clearInterval(id);
          // close reason , descripton
          this.context.close(1000, "NODEFONY CONTROLLER CLOSE SOCKET");
          id = null;
        }, 10000);
        this.listen(this, "onClose", () => {
          if (id) {
            clearInterval(id);
          }
        });
      }
      break;
    default:
      throw new Error("REALTIME METHOD NOT ALLOWED");
    }
  }

};