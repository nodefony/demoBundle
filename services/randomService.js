const net = require("net");
// const xml = require('xml2js');


/* const randomChain = function () {
  var txt = "";
  //for (var i = 0 ; i < 65481; i++){
  for (var i = 0; i < 35000; i++) {
    txt += "A";
  }
  return txt + "EOF";

}();*/

const Random = class Random {
  constructor (service) {
    this.service = service;
    this.interval = null;
    this.notificationsCenter = nodefony.notificationsCenter.create();
  }

  start (time) {
    this.interval = setInterval(() => {
      const value = parseInt(Math.random() * 100, 10);
      // value  = randomChain;
      // this.service.logger(value, "DEBUG");
      this.notificationsCenter.fire("tic", value);
    }, time || 1000);
  }

  listen (context, callback) {
    this.notificationsCenter.listen(context || this, "tic", callback);
  }

  unListen (callback) {
    this.notificationsCenter.unListen("tic", callback);
  }

  stop () {
    return clearInterval(this.interval);
  }
};

const connection = class connection {
  constructor (socket) {
    this.socket = socket;
    this.id = `${socket._handle.fd}_${socket.server._connectionKey}`;
    this.readable = socket.readable;
    this.writable = socket.writable;
  }

  write (data) {
    this.socket.write(data);
  }
};

module.exports = class random {
  constructor (realTime, container, kernel) {
    this.realTime = realTime;
    this.kernel = kernel;
    if (!this.realTime) {
      this.kernel.log("REALIME SERVICE NOT FOUND", "WARNING", "SERVICE RANDOM");
      return;
    }
    this.container = container;
    this.random = new Random(this);
    this.name = "random";
    this.status = "disconnect";
    // this.nbConnections = 0 ;
    this.connections = [];
    this.domain = kernel.domain;
    this.port = 1315;
    this.server = null;

    this.kernel.once("onReady", () => {
      if (this.kernel.type === "SERVER") {
        this.port = this.container.getParameters("bundles.realtime.services.random.port") || 1315;
        this.createServer();
        this.protocol = new nodefony.io.protocol["json-rpc"]();
      }
    });
  }

  log (pci, severity, msgid) {
    if (!msgid) {
      msgid = "RANDOM";
    }
    if (this.realTime) {
      this.realTime.log(pci, severity, "RANDOM");
    } else {
      this.kernel.log(pci, severity, "RANDOM");
    }
  }

  stopServer () {
    this.stopped = true;
    for (let i = 0; i < this.connections.length; i++) {
      this.connections[i].socket.end();
      const {id} = this.connections[i];
      delete this.connections[id];
    }
    this.connections.length = 0;
    if (this.server) {
      try {
        this.server.close();
      } catch (e) {
        this.log(e, "ERROR");
      }
    }
  }

  createServer () {
    this.server = net.createServer({
      allowHalfOpen: true
    }, (socket) => {
      // var d = nodedomain.create();
      // d.on('error', (er) => {
      //	this.realTime.logger(er.stack);
      // });
      // d.add(socket);
      // d.run(() => {
      socket.write("READY");
      this.stopped = false;
      // });
    });

    /*
     *	EVENT CONNECTIONS
     */
    this.server.on("connection", (socket) => {
      this.log(`CONNECT TO SERVICE RANDOM FROM : ${socket.remoteAddress}`, "INFO");
      const conn = new connection(socket);
      this.connections.push(conn);
      this.connections[conn.id] = this.connections[this.connections.length - 1];
      let closed = false;
      const callback = (value) => {
        try {
          if (closed || this.stopped) {
            return;
          }
          conn.write(this.protocol.methodSuccees(value));
        } catch (e) {
          this.log(e, "ERROR");
        }
      };
      this.random.listen(this, callback);

      socket.on("end", () => {
        // console.log(arguments)
        closed = true;
        this.log(`CLOSE CONNECTION TO SERVICE RANDOM FROM : ${socket.remoteAddress} ID :${conn.id}`, "INFO");
        this.random.unListen(callback);
        socket.end();
        this.server.getConnections((err, nb) => {
          if (nb === 0) {
            this.random.stop();
          }
        });
        delete this.connections[conn.id];
      });

      socket.on("data", (buffer) => {
        try {
          const message = this.protocol.onMessage(buffer.toString());
          switch (message.method) {
          case "start":
            this.server.getConnections((err, nb) => {
              if (nb === 1) {
                try {
                  this.random.start.apply(this.random, message.params);
                } catch (e) {
                  conn.write(this.protocol.methodError(e.message, message.id));
                }
              }
            });
            break;
          case "stop":
            try {
              this.random.stop.apply(this.random, message.params);
            } catch (e) {
              conn.write(this.protocol.methodError(e.message, message.id));
            }
            break;
          }
        } catch (e) {
          // conn.write(this.protocol.methodError(e.message, message.id));
          this.log(`message :${buffer.toString()} error : ${e.message}`, "ERROR");
        }
      });
    });

    /*
     *	EVENT CLOSE
     */
    this.server.on("close", (/* socket*/) => {
      this.stopped = true;
      this.realTime.log(`SHUTDOWN server RANDOM listen on Domain : ${this.domain} Port : ${this.port}`, "INFO");
    });

    /*
     *	EVENT ERROR
     */
    this.server.on("error", (error) => {
      const myError = new nodefony.Error(error);
      switch (error.errno) {
      case "ENOTFOUND":
        this.log(`CHECK DOMAIN IN /etc/hosts or config unable to connect to : ${this.domain}`, "ERROR");
        this.log(myError, "CRITIC");
        break;
      case "EADDRINUSE":
        this.log(`Domain : ${this.domain} Port : ${this.port} ==> ALREADY USE `, "ERROR");
        this.log(myError, "CRITIC");
        setTimeout(() => {
          this.server.close();
        }, 1000);
        break;
      default:
        this.log(myError, "CRITIC");
      }
    });

    /*
     *	LISTEN ON DOMAIN
     */
    this.server.listen(this.port, this.domain, () => {
      this.realTime.log(`Create server RANDOM listen on Domain : ${this.domain} Port : ${this.port}`, "INFO");
    });

    /*
     *  KERNEL EVENT TERMINATE
     */
    this.kernel.once("onTerminate", () => {
      this.stopServer();
    });
  }
};
