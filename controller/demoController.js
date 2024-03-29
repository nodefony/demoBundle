/*
 *
 *	CONTROLLER default
 *
 */
const {execSync} = require("child_process");
const {exec} = require("child_process");
const {spawn} = require("child_process");
const http = require("http");
const https = require("https");

module.exports = class demoController extends nodefony.controller {
  constructor (container, context) {
    super(container, context);
  }

  /**
   *
   *    @Route ("/demo",
   *      name="demo")
   */
  indexAction () {
    // return  OBJECT by default view is : demo-bundle:demo:index.html.twig
    return {
      title: "nodefony",
      user: this.context.user,
      version: this.kernel.version,
      nodefony: `${this.kernel.settings.name} ${this.kernel.settings.system.version}`
    };
    // WITH RENDER
    /* return this.render("demo-bundle:demo:index.html.twig",{
    	title:"nodefony",
    	user: this.context.user,
    	nodefony:this.kernel.settings.name + " " + this.kernel.settings.system.version
    });*/
  }

  /**
   *	 renderView
   *
   */
  renderviewAction () {
    const content = this.renderView("demo-bundle:demo:documentation.html.twig", {
      name: "render"
    });
    return this.renderResponse(content);
  }

  /**
   *	@see renderResponse() with content html
   *
   */
  htmlAction () {
    return this.renderResponse("<h1> renderResponse </h1>");
  }

  /**
   *
   *	@see forward
   */
  forwardAction () {
    return this.forward("frameworkBundle:default:index");
  }

  /**
   *
   *	@see redirect
   */
  redirectGoogleAction () {
    // status 301 or 302
    return this.redirect("http://google.com");
    // return this.redirect("/json", 302);
  }

  /**
   *
   *	render JSON
   */
  jsonAction () {
    return this.renderJson({
      foo: "bar",
      bar: "foo"
    });
  }

  jsonAsyncAction () {
    setTimeout(() => this.renderJson({
      foo: "bar",
      bar: "foo"
    }));
  }

  /**
   *
   *	@see redirect with variables
   *	@see generateUrl
   */
  generateUrlAction () {
    // absolute
    return this.redirect(this.generateUrl("user", {
      name: "cci"
    }, true));

    // relative
    // return this.redirect ( this.generateUrl("user", {name:"cci"} );
  }

  readmeAction () {
    const Path = `${this.kernel.rootDir}/README.md`;
    const file = new nodefony.fileClass(Path);
    const res = this.htmlMdParser(file.content(), {
      linkify: true,
      typographer: true
    });
    return this.render("demo-bundle:demo:documentation.html.twig", {
      html: res
    });
  }

  /**
   *
   *	DEMO navbar
   *
   */
  navAction (login) {
    let audio = null;
    try {
      audio = this.generateUrl("webAudioApi");
    } catch (e) {
      audio = null;
    }
    return this.renderSync("demo-bundle:layouts:navBar.html.twig", {
      user: this.context.user,
      audio,
      angular: this.kernel.getBundles("angular"),
      react: this.kernel.getBundles("react"),
      login
    });
  }

  /**
   *
   *	DEMO navbar
   *
   */
  docAction () {
    const docBundle = this.kernel.getBundles("documentation");
    if (docBundle) {
      return this.forward("documentation-bundle:default:navDoc");
    }
    return this.renderSync("demo-bundle:demo:navDoc.html.twig");
  }

  /**
   *
   *	 footer
   *
   *
   */
  footerAction () {
    const translateService = this.get("translation");
    const {version} = this.kernel.settings;
    const path = this.generateUrl("home");
    const year = new Date().getFullYear();
    const langs = translateService.getLangs();
    const locale = this.getLocale();
    let langOptions = "";
    for (const ele in langs) {
      if (locale === langs[ele].value) {
        langOptions += `<option value="${langs[ele].value}" selected >${langs[ele].name}</option>`;
      } else {
        langOptions += `<option value="${langs[ele].value}" >${langs[ele].name}</option>`;
      }
    }
    const html = `<nav class="navbar navbar-default navbar-fixed-bottom" role="navigation">\
				<div class"container-fluid">\
				<div class="navbar-header">\
					<button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#footer-collapse">\
						<span class="sr-only">Toggle navigation</span>\
						<span class="icon-bar"></span>\
						<span class="icon-bar"></span>\
						<span class="icon-bar"></span>\
					</button>\
					<a class=" text-primary navbar-text" href="${path}" style="margin-left:20px" >\
					${year}\
					<strong class="text-primary"> NODEFONY ${version}  ©</strong> \
					</a>\
				</div>\
				<div class="collapse navbar-collapse" id="footer-collapse">\
					<ul class="nav navbar-nav navbar-left">\
					</ul>\
					<ul class="nav navbar-nav navbar-right">\
						<li  class="navbar-btn pull-right" style="margin-right:40px">\
							<select id="langs" name="hl" class="form-control">\
							${langOptions}\
							</select>\
						</li>\
					</div>\
				</div>\
				</div>\
			</div>`;
    return this.renderResponse(html);
  }

  /**
   *
   *	DEMO RENDER RAW RESPONSE  SYNC
   *  @Method ({"GET"})
   *  @Route ("/xmlResponse",
   *      name="xmlResponse")
   */
  rawResponseSyncAction () {
    // override timeout response
    // this.getResponse().setTimeout(10000);
    // return ;

    const {settings} = this.kernel;
    const content = `<xml><nodefony>\
				<kernel name="${settings.name}" version="${settings.system.version}">\
					<server type="HTTP" port="${settings.system.httpPort}"></server>\
					<server type="HTTPS" port="${settings.system.httpsPort}"></server>\
				</kernel>\
			</nodefony></xml>`;
    return this.renderResponse(content, 200, {
      "Content-Type": "Application/xml"
    });
  }

  /**
   *
   *	DEMO RENDER RAW RESPONSE ASYNC
   *  @Method ({"GET"})
   *  @Route ("/xmlAsyncResponse",
   *      name="xmlAsyncResponse")
   */
  rawResponseAsyncAction () {
    const {settings} = this.kernel;

    // async CALL
    /* var childHost =*/
    exec("hostname", (error, stdout /* , stderr*/) => {
      const hostname = stdout;

      const content = `<xml><nodefony>\
				<kernel name="${settings.name}" version="${settings.system.version}">\
					<server type="HTTP" port="${settings.system.httpPort}"></server>\
					<server type="HTTPS" port="${settings.system.httpsPort}"></server>\
					<hostname>${hostname}</hostname>\
				</kernel>\
				</nodefony></xml>`;
      return this.renderResponseAsync(content, 200, {
        "Content-Type": "Application/xml"
      });
    });
  }


  /*
   *
   *	SYSTEM CALL NODEJS WITH PROMISE
   *  @Method ({"GET"})
   *  @Route ("/syscall",
   *      name="syscall")
   */
  syscallAction () {
    const tab = [];
    // system call  exec synchrone hostname
    tab.push(new Promise((resolve, reject) => {
      try {
        const childHost = execSync("hostname");
        const res = childHost.toString();
        resolve(res);
        return res;
      } catch (e) {
        reject(e);
      }
    }));

    // exec PWD
    tab.push(new Promise((resolve, reject) => exec("pwd", (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      if (stderr) {
        this.log(stderr, "ERROR");
      }
      return resolve(stdout);
    })));


    // system call  spawn ping
    tab.push(new Promise((resolve /* , reject*/) => {
      const du = spawn("ping", ["-c", "3", "google.com"]);
      let str = "";
      let err = "";
      // var code = "" ;

      du.stdout.on("data", (data) => {
        str += data;
      });

      du.stderr.on("data", (data) => {
        err += data;
        this.log(`ERROR : ${err}`, "ERROR");
      });

      du.on("close", (code) => {
        code = code;
        this.log(`child process exited with code : ${code}`, "INFO");
        resolve({
          ping: str,
          code,
          error: err
        });
      });
    }));

    let ping = "";
    let err = "";
    let code = "";
    let hostname = "";
    let pwd = "";

    // CALL PROMISE
    return Promise.all(tab)
      .then((result) => {
        // format result for pass in renderAsync view
        hostname = result[0];
        pwd = result[1];
        ping = result[2].ping;
        code = result[2].code;
        err = result[2].err;
        this.log("PROMISE SYSCALL DONE", "DEBUG");
        return this.render("demo-bundle:demo:exec.html.twig", {
          hostname,
          ping,
          pwd,
          code,
          error: err,
          date: new Date()
        });
      })
      .catch((e) => {
        this.log(e, "ERROR");
        this.createException(e);
      });
  }

  /*
   *
   *	HTTP REQUEST FOR PROXY
   *  @Method ({"GET"})
   *  @Route ("/httpRequest",
   *      name="httpRequest")
   */
  httpRequestAction () {
    // hide debug bar
    this.hideDebugBar();
    // this.getResponse().setTimeout(5000)
    // return
    const Path = this.generateUrl("xmlAsyncResponse");
    const host = `${this.context.request.url.protocol}//${this.context.request.url.host}${Path}`;
    const {type} = this.context;
    // cookie session
    const headers = {};
    if (this.context.session) {
      headers.Cookie = `${this.context.session.name}=${this.context.session.id}`;
    }
    const options = {
      hostname: this.context.request.url.hostname,
      port: this.context.request.url.port,
      path: Path,
      method: "GET",
      headers
    };
    let wrapper = http.request;
    let keepAliveAgent = null;

    // https
    if (this.context.request.url.protocol === "https:") {
      // keepalive if multiple request in same socket
      keepAliveAgent = new https.Agent({
        keepAlive: true
      });
      // certificat
      const certificats = this.get("httpsServer").getCertificats();
      nodefony.extend(options, {
        key: certificats.key,
        cert: certificats.cert,
        ca: certificats.ca,
        rejectUnauthorized: false,
        requestCert: true,
        agent: keepAliveAgent
      });
      wrapper = https.request;
    } else {
      // keepalive
      keepAliveAgent = new http.Agent({
        keepAlive: true
      });
      options.agent = keepAliveAgent;
    }

    const req = wrapper(options, (res) => {
      let bodyRaw = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        this.log(chunk, "DEBUG");
        bodyRaw += chunk;
      });
      res.on("end", () => {
        this.renderAsync("demo-bundle:demo:httpRequest.html.twig", {
          host,
          type,
          bodyRaw
        });
      });
    });
    req.on("error", (e) => {
      this.log(`Problem with request: ${e.message}`, "ERROR");
      this.renderAsync("demo-bundle:demo:httpRequest.html.twig", {
        host,
        type,
        bodyRaw: e
      });
    });
    req.end();
  }

  /**
   *
   *	@method indexRealTimeAction
   *
   */
  indexRealTimeAction () {
    return this.render("demo-bundle:realTime:index.html.twig", {
      title: "realTime"
    });
  }
};
