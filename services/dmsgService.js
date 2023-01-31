const net = require("net");

const connection = class connection {
  constructor (socket) {
    this.socket = socket;
    this.id = `${socket._handle.fd}_${socket.server._connectionKey}`;
    this.readable = socket.readable;
    this.writable = socket.writable;
  }

  write (data) {
    this.socket.write(`${data}`);
  }
};

/*
 *
 *
 *
 *
 */
module.exports = class dmsg {
  constructor (realTime, container, kernel) {
    this.realTime = realTime;
    this.kernel = kernel;
    if (!this.realTime) {
      this.kernel.log("REALIME SERVICE NOT FOUND", "WARNING", "SERVICE DMSG");
      return;
    }
    this.container = container;
    this.status = "disconnect";
    this.connections = [];
    this.domain = kernel.domain;
    this.port = 1316;
    this.nbConnections = 0;

    this.fileDmsg = this.kernel.platform === "darwin" ? "/var/log/system.log" : "/var/log/message";

    this.kernel.once("onReady", () => {
      if (this.kernel.type === "SERVER") {
        this.port = this.container.getParameters("bundles.realtime.services.dmsg.port") || 1316;
        this.createWatcher();
        this.server = null;
        this.createServer();
      }
    });
  }

  log (pci, severity, msgid) {
    if (!msgid) {
      msgid = "DMSG";
    }
    return this.realTime.log(pci, severity, "SERVICE DMSG");
  }

  createWatcher () {
    try {
      this.watcher = new nodefony.Watcher(null, {
        persistent: true,
        followSymlinks: false,
        usePolling: true,
        interval: 60,
        binaryInterval: 300
      }, this.container);

      this.watcher.on("onError", (error) => {
        this.realTime.log(error, "ERROR");
      });
      this.watcher.on("onClose", (/* watcher*/) => {
        // this.realTime.logger(watcher);
      });
    } catch (e) {
      this.log(e, "ERROR");
    }
  }

  createServer () {
    this.server = net.createServer({
      // allowHalfOpen : true
    }, (socket) => {
      let conn = new connection(socket);
      this.connections[conn.fd] = conn;
      const callback = (path /* , stat*/) => {
        let lastLine = null;
        try {
          // this.realTime.logger(stat.size, "DEBUG","SEVICE DMSG");
          if (conn) {
            const file = new nodefony.fileClass(path);
            if (file) {
              const content = file.content();
              // console.log(content)
              const lines = content.trim().split("\n");
              lastLine = lines.slice(-1)[0];
            }
            conn.write(lastLine);
            // conn.write(stat.size);
          }
        } catch (e) {
          this.log(e, "ERROR");
        }
      };
      this.watcher.listen(this, "onChange", callback);
      socket.on("end", () => {
        this.log(`CLOSE CONNECTION TO SERVICE DMSG FROM : ${socket.remoteAddress} ID :${conn.id}`, "INFO");
        delete this.connections[conn.fd];
        this.watcher.removeListener("onChange", callback);
        conn = null;
        this.nbConnections--;
        if (this.nbConnections === 0) {
          this.watcher.close();
        }
        socket.end();
      });
      conn.write(`WATCHER READY : ${this.fileDmsg}`);
    });

    this.server.on("connection", (socket) => {
      this.log(`CONNECT TO SERVICE DMSG FROM : ${socket.remoteAddress}`, "INFO");
      socket.on("data", (/* buffer*/) => {
        try {
          if (this.nbConnections === 0) {
            this.watcher.watch(this.fileDmsg);
          }
          this.nbConnections++;
        } catch (e) {
          this.realTime.log(e, "ERROR");
        }
      });
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
     *	EVENT CLOSE
     */
    this.server.on("close", (/* socket*/) => {
      this.realTime.log(`SHUTDOWN server DMSG listen on Domain : ${this.domain} Port : ${this.port}`, "INFO");
    });


    /*
     *	LISTEN ON DOMAIN
     */
    this.server.listen(this.port, this.domain, () => {
      this.realTime.log(`Create server DMSG listen on Domain : ${this.domain} Port : ${this.port}`, "INFO");
    });

    this.kernel.once("onTerminate", () => {
      this.stopServer();
    });
  }

  stopServer () {
    for (const connection in this.connections) {
      this.connections[connection].socket.end();
      delete this.connections[connection];
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
};
