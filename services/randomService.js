const net = require('net');
//const xml = require('xml2js');



/*const randomChain = function () {
  var txt = "";
  //for (var i = 0 ; i < 65481; i++){
  for (var i = 0; i < 35000; i++) {
    txt += "A";
  }
  return txt + "EOF";

}();*/

const Random = class Random {

  constructor(service) {
    this.service = service;
    this.interval = null;
    this.notificationsCenter = nodefony.notificationsCenter.create();

  }

  start(time) {
    this.interval = setInterval(() => {
      let value = parseInt(Math.random() * 100, 10);
      //value  = randomChain;
      //this.service.logger(value, "DEBUG");
      this.notificationsCenter.fire("tic", value);
    }, time || 1000);
  }

  listen(context, callback) {
    this.notificationsCenter.listen(context || this, "tic", callback);
  }

  unListen(callback) {
    this.notificationsCenter.unListen("tic", callback);
  }

  stop() {
    return clearInterval(this.interval);
  }
};

const connection = class connection {

  constructor(socket) {
    this.socket = socket;
    this.id = socket._handle.fd + "_" + socket.server._connectionKey;
    this.readable = socket.readable;
    this.writable = socket.writable;
  }

  write(data) {
    this.socket.write(data);
  }
};

module.exports = class random {
  constructor(realTime, container, kernel) {

    this.realTime = realTime;
    this.kernel = kernel;
    if (!this.realTime) {
      this.kernel.logger("REALIME SERVICE NOT FOUND", "WARNING", "SERVICE RANDOM");
      return;
    }
    this.container = container;
    this.random = new Random(this);
    this.name = "random";
    this.status = "disconnect";
    //this.nbConnections = 0 ;
    this.connections = [];
    this.domain = kernel.domain;
    this.port = 1315;
    this.server = null;

    this.kernel.listen(this, "onReady", () => {
      if (this.kernel.type === "SERVER") {
        this.port = this.container.getParameters("bundles.realTime.services.random.port") || 1315;
        this.createServer();
        this.protocol = new nodefony.io.protocol["json-rpc"]();
      }
    });
  }

  logger(pci, severity, msgid) {
    if (!msgid) {
      msgid = "SERVICE RANDOM ";
    }
    if (this.realTime) {
      this.realTime.logger(pci, severity, "SERVICE RANDOM");
    } else {
      this.kernel.logger(pci, severity, "SERVICE RANDOM");
    }
  }

  stopServer() {
    this.stopped = true;
    for (let i = 0; i < this.connections.length; i++) {
      this.connections[i].socket.end();
      let id = this.connections[i].id;
      delete this.connections[id];
    }
    this.connections.length = 0;
    if (this.server) {
      try {
        this.server.close();
      } catch (e) {
        this.logger(e, "ERROR");
      }
    }
  }

  createServer() {
    this.server = net.createServer({
      allowHalfOpen: true
    }, (socket) => {
      //var d = nodedomain.create();
      //d.on('error', (er) => {
      //	this.realTime.logger(er.stack);
      //});
      //d.add(socket);
      //d.run(() => {
      socket.write("READY");
      this.stopped = false;
      //});
    });

    /*
     *	EVENT CONNECTIONS
     */
    this.server.on("connection", (socket) => {
      this.logger("CONNECT TO SERVICE RANDOM FROM : " + socket.remoteAddress, "INFO");
      let conn = new connection(socket);
      this.connections.push(conn);
      this.connections[conn.id] = this.connections[this.connections.length - 1];
      let closed = false;
      let callback = (value) => {
        try {
          if (closed || this.stopped) {
            return;
          }
          conn.write(this.protocol.methodSuccees(value));
        } catch (e) {
          this.logger(e, "ERROR");
        }
      };
      this.random.listen(this, callback);

      socket.on('end', () => {
        //console.log(arguments)
        closed = true;
        this.logger("CLOSE CONNECTION TO SERVICE RANDOM FROM : " + socket.remoteAddress + " ID :" + conn.id, "INFO");
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
          let message = this.protocol.onMessage(buffer.toString());
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
          //conn.write(this.protocol.methodError(e.message, message.id));
          this.logger("message :" + buffer.toString() + " error : " + e.message, "ERROR");
        }
      });
    });

    /*
     *	EVENT CLOSE
     */
    this.server.on("close", ( /*socket*/ ) => {
      this.stopped = true;
      this.realTime.logger("SHUTDOWN server RANDOM listen on Domain : " + this.domain + " Port : " + this.port, "INFO");
    });

    /*
     *	EVENT ERROR
     */
    this.server.on("error", (error) => {
      //this.logger( "SERVICE RANDOM domain : "+this.domain+" Port : "+this.port +" ==> " + error ,"ERROR");
      let httpError = error.errno;
      switch (error.errno) {
      case "EADDRINUSE":
        this.logger(new Error(httpError + " " + this.domain + " Port : " + this.port + " ==> " + error), "CRITIC");
        setTimeout(() => {
          this.server.close();
        }, 1000);
        break;
      default:
        this.logger(new Error(httpError), "CRITIC");
      }
    });

    /*
     *	LISTEN ON DOMAIN
     */
    this.server.listen(this.port, this.domain, () => {
      this.realTime.logger("Create server RANDOM listen on Domain : " + this.domain + " Port : " + this.port, "INFO");
    });

    /*
     *  KERNEL EVENT TERMINATE
     */
    this.kernel.listen(this, "onTerminate", () => {
      this.stopServer();
    });
  }
};
