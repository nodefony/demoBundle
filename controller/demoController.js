/*
 *
 *
 *
 *	CONTROLLER default
 *
 *
 *
 *
 */
let execSync = require('child_process').execSync;
let exec = require('child_process').exec;
let spawn = require('child_process').spawn;

module.exports = nodefony.registerController("demo", function () {


    const demoController = class demoController extends nodefony.controller {

        constructor(container, context) {
            super(container, context);
        }

        /**
         *
         *	DEMO index
         *
         */
        indexAction() {
            // return  OBJECT by default view is : demoBundle:demo:index.html.twig
            return {
                title: "nodefony",
                user: this.context.user,
                version: this.kernel.version,
                nodefony: this.kernel.settings.name + " " + this.kernel.settings.system.version
            };
            // WITH RENDER
            /*return this.render("demoBundle:demo:index.html.twig",{
            	title:"nodefony",
            	user: this.context.user,
            	nodefony:this.kernel.settings.name + " " + this.kernel.settings.system.version
            });*/
        }

        /**
         *	 renderView
         *
         */
        renderviewAction() {
            let content = this.renderView('demoBundle:Default:documentation.html.twig', {
                name: "render"
            });
            return this.renderResponse(content);
        }

        /**
         *	@see renderResponse() with content html
         *
         */
        htmlAction() {
            return this.renderResponse('<h1> renderResponse </h1>');
        }

        /**
         *
         *	@see forward
         */
        forwardAction() {
            return this.forward("frameworkBundle:default:index");
        }

        /**
         *
         *	@see redirect
         */
        redirectGoogleAction() {
            // status 301 or 302
            return this.redirect("http://google.com");
            //return this.redirect("/json", 302);
        }

        /**
         *
         *	render JSON
         */
        jsonAction() {
            return this.renderJson({
                foo: "bar",
                bar: "foo"
            });
        }

        /**
         *
         *	@see redirect with variables
         *	@see generateUrl
         */
        generateUrlAction() {
            // absolute
            return this.redirect(this.generateUrl("user", {
                name: "cci"
            }, true));

            // relative
            //return this.redirect ( this.generateUrl("user", {name:"cci"} );
        }

        /**
         *
         *	DEMO WEBSOCKET
         */
        websoketAction(message) {
            let context = this.getContext();
            switch (this.getMethod()) {
            case "GET":
                return this.render('demoBundle:Default:websocket.html.twig', {
                    name: "websoket"
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
                        //context.send(mess);
                        this.renderResponse(mess);
                        i++;
                    }, 1000);

                    setTimeout(() => {
                        clearInterval(id);
                        // close reason , descripton
                        context.close(1000, "NODEFONY CONTROLLER CLOSE SOCKET");
                        id = null;
                    }, 10000);
                    this.context.listen(this, "onClose", () => {
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

        /**
         *
         *	DEMO ORM ASYNC CALL WITHOUT ENTITIES
         *	SQL SELECT
         *
         */
        querySqlAction() {
            let orm = this.getORM();
            let nodefonyDb = orm.getConnection("nodefony");
            return nodefonyDb.query('SELECT * FROM users')
                .then((result) => {
                    return this.render('demoBundle:orm:orm.html.twig', {
                        users: result[0],
                    });
                });
        }

        /**
         *
         *	DEMO ORM ASYNC CALL WITHOUT ENTITIES
         *	SQL WITH JOIN
         *
         *
         */
        querySqlJoinAction() {
            let orm = this.getORM();
            let nodefonyDb = orm.getConnection("nodefony");
            return nodefonyDb.query('SELECT * FROM sessions S LEFT JOIN users U on U.id = S.user_id ')
                .then((result) => {
                    let joins = result[0];
                    for (let i = 0; i < joins.length; i++) {
                        joins[i].metaBag = JSON.parse(joins[i].metaBag);
                    }
                    return this.render('demoBundle:orm:orm.html.twig', {
                        joins: joins,
                    });
                });
        }

        readmeAction() {
            let Path = this.kernel.rootDir + '/README.md';
            let file = new nodefony.fileClass(Path);
            let res = this.htmlMdParser(file.content(), {
                linkify: true,
                typographer: true
            });
            return this.render('demoBundle:Default:documentation.html.twig', {
                html: res
            });
        }

        /**
         *
         *	DEMO navbar
         *
         */
        navAction(login) {
            let audio = null;
            try {
                audio = this.generateUrl("webAudioApi");
            } catch (e) {
                audio = null;
            }
            return this.render('demoBundle:layouts:navBar.html.twig', {
                user: this.context.user,
                audio: audio,
                webrtc: this.kernel.getBundles("webrtc"),
                angular: this.kernel.getBundles("angular"),
                login: login
            });
        }

        /**
         *
         *	DEMO navbar
         *
         */
        docAction() {
            let docBundle = this.kernel.getBundles("documentation");
            if (docBundle) {
                return this.forward("documentationBundle:default:navDoc");
            }
            return this.render('demoBundle:Default:navDoc.html.twig');
        }

        /**
         *
         *	DEMO footer
         *
         *
         */
        footerAction() {
            let translateService = this.get("translation");
            let version = this.kernel.settings.version;
            let path = this.generateUrl("home");
            let year = new Date().getFullYear();
            let langs = translateService.getLangs();
            let locale = translateService.getLocale();
            let langOptions = "";
            for (let ele in langs) {
                if (locale === langs[ele].value) {
                    langOptions += '<option value="' + langs[ele].value + '" selected >' + langs[ele].name + '</option>';
                } else {
                    langOptions += '<option value="' + langs[ele].value + '" >' + langs[ele].name + '</option>';
                }
            }
            let html = '<nav class="navbar navbar-default navbar-fixed-bottom" role="navigation">\
				<div class"container-fluid">\
				<div class="navbar-header">\
					<button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#footer-collapse">\
						<span class="sr-only">Toggle navigation</span>\
						<span class="icon-bar"></span>\
						<span class="icon-bar"></span>\
						<span class="icon-bar"></span>\
					</button>\
					<a class=" text-primary navbar-text" href="' + path + '" style="margin-left:20px" >\
					' + year + '\
					<strong class="text-primary"> NODEFONY ' + version + '  ©</strong> \
					</a>\
				</div>\
				<div class="collapse navbar-collapse" id="footer-collapse">\
					<ul class="nav navbar-nav navbar-left">\
					</ul>\
					<ul class="nav navbar-nav navbar-right">\
						<li  class="navbar-btn pull-right" style="margin-right:40px">\
							<select id="langs" name="hl" class="form-control">\
							' + langOptions + '\
							</select>\
						</li>\
					</div>\
				</div>\
				</div>\
			</div>';
            return this.renderResponse(html);
        }

        /**
         *
         *	DEMO RENDER RAW RESPONSE  SYNC
         *
         */
        rawResponseSyncAction() {
            // override timeout response
            //this.getResponse().setTimeout(10000);
            //return ;

            let settings = this.kernel.settings;
            let content = '<xml><nodefony>\
				<kernel name="' + settings.name + '" version="' + settings.system.version + '">\
					<server type="HTTP" port="' + settings.system.httpPort + '"></server>\
					<server type="HTTPS" port="' + settings.system.httpsPort + '"></server>\
				</kernel>\
			</nodefony></xml>';
            return this.renderResponse(content, 200, {
                "content-type": "Application/xml"
            });
        }

        /**
         *
         *	DEMO RENDER RAW RESPONSE ASYNC
         *
         */
        rawResponseAsyncAction() {
            let settings = this.kernel.settings;

            // async CALL
            /*var childHost =*/
            exec('hostname', (error, stdout /*, stderr*/ ) => {
                let hostname = stdout;

                let content = '<xml><nodefony>\
				<kernel name="' + settings.name + '" version="' + settings.system.version + '">\
					<server type="HTTP" port="' + settings.system.httpPort + '"></server>\
					<server type="HTTPS" port="' + settings.system.httpsPort + '"></server>\
					<hostname>' + hostname + '</hostname>\
				</kernel>\
				</nodefony></xml>';
                return this.renderResponse(content, 200, {
                    "content-type": "Application/xml"
                });
            });
        }

        /**
         *
         *	DEMO ORM ASYNC CALL WITH ENTITIES
         *
         */
        sequelizeAction() {
            let orm = this.getORM();
            let sessionEntity = orm.getEntity("session");
            let userEntity = orm.getEntity("user");

            // SIMPLE ORM CALL RENDER WITH SEQUELIZE PROMISE
            /*return sessionEntity.findAll()
            .then( (results) => {
            	//sessions = results;
            	return this.render('demoBundle:orm:orm.html.twig', {
            		sessions:results,
            	});
            })
            .catch(function(error){
            	throw error ;
            })
            return ;*/

            // MULTIPLE ORM CALL ASYNC RENDER WITH PROMISE
            return Promise.all([sessionEntity.findAll(), userEntity.findAll()])
                .then((result) => {
                    return this.render('demoBundle:orm:orm.html.twig', {
                        sessions: result[0],
                        users: result[1],
                    });
                }).catch((error) => {
                    this.createException(error);
                });
        }

        /**
         *
         *	DEMO ORM INSERT ENTITIES
         *
         */
        addUserAction() {
            let orm = this.getORM();
            let userEntity = orm.getEntity("user");
            let users = null;
            // FORM DATA
            let query = this.getParameters("query");

            // here start session for flashbag because action is not on secure area and not autostart session
            if (!this.context.session) {
                this.startSession("default", (error /*, session*/ ) => {
                    if (error) {
                        this.setFlashBag("error", error);
                        return this.redirect(this.generateUrl("subscribe"));
                    }
                    // GET FACTORY SECURE TO ENCRYPTE PASSWORD
                    //let firewall = this.get("security");
                    //let area = firewall.getSecuredArea("demo_area") ;
                    //let factory = area.getFactory();
                    //let realm = factory.settings.realm ;
                    //let cryptpwd = factory.generatePasswd(realm, query.post.usernameCreate, query.post.passwordCreate);
                    userEntity.create({
                            username: query.post.usernameCreate,
                            email: query.post.emailCreate,
                            password: query.post.passwordCreate,
                            name: query.post.nameCreate,
                            surname: query.post.surnameCreate,
                        })
                        .then((results) => {
                            users = results;
                            this.setFlashBag("adduser", " Add user  : " + query.post.usernameCreate + " OK");
                            return this.redirect(this.generateUrl("saslArea"));
                        })
                        .catch((error) => {
                            this.logger(util.inspect(error.errors));
                            this.setFlashBag("error", error.errors[0].message);
                            return this.redirect(this.generateUrl("subscribe"));
                        });
                });
            } else {
                // GET FACTORY SECURE TO ENCRYPTE PASSWORD
                //let firewall = this.get("security");
                //let area = firewall.getSecuredArea("demo_area") ;
                //let factory = area.getFactory();
                //let realm = factory.settings.realm ;
                //let cryptpwd = factory.generatePasswd(realm, query.post.usernameCreate, query.post.passwordCreate);
                return this.userEntity.create({
                        username: query.post.usernameCreate,
                        email: query.post.emailCreate,
                        password: query.post.passwordCreate,
                        name: query.post.nameCreate,
                        surname: query.post.surnameCreate,
                    })
                    .then((results) => {
                        users = results;
                        this.getSession().invalidate();
                        this.setFlashBag("adduser", " Add user  : " + query.post.usernameCreate + " OK");
                        return this.redirect(this.generateUrl("saslArea"));

                    })
                    .catch((error) => {
                        if (error.errors) {
                            this.logger(util.inspect(error.errors));
                            this.setFlashBag("error", error.errors[0].message);
                            return this.redirect(this.generateUrl("subscribe"));
                        } else {
                            this.logger(util.inspect(error), "ERROR");
                            this.setFlashBag("error", error.message);
                            return this.redirect(this.generateUrl("subscribe"));
                        }
                    });
            }
        }

        /*
         *
         *	SYSTEM CALL NODEJS WITH PROMISE
         */
        syscallAction() {
            let tab = [];
            // system call  exec synchrone hostname
            tab.push(new Promise(function (resolve, reject) {
                try {
                    let childHost = execSync('hostname');
                    let res = childHost.toString();
                    resolve(res);
                    return res;
                } catch (e) {
                    reject(e);
                }
            }));

            // exec PWD
            tab.push(new Promise((resolve, reject) => {
                return exec("pwd", (error, stdout, stderr) => {
                    if (error) {
                        return reject(error);
                    }
                    if (stderr) {
                        this.logger(stderr, "ERROR");
                    }
                    return resolve(stdout);
                });
            }));


            // system call  spawn ping
            tab.push(new Promise((resolve /*, reject*/ ) => {
                let du = spawn('ping', ['-c', "3", "google.com"]);
                let str = "";
                let err = "";
                //var code = "" ;

                du.stdout.on('data', function (data) {
                    str += data;
                });

                du.stderr.on('data', (data) => {
                    err += data;
                    this.logger("ERROR : " + err, "ERROR");
                });

                du.on('close', (code) => {
                    code = code;
                    this.logger("child process exited with code : " + code, "INFO");
                    resolve({
                        ping: str,
                        code: code,
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
                    this.logger("PROMISE SYSCALL DONE", "DEBUG");
                    return this.render("demoBundle:Default:exec.html.twig", {
                        hostname: hostname,
                        ping: ping,
                        pwd: pwd,
                        code: code,
                        error: err,
                        date: new Date()
                    });
                }).catch((e) => {
                    this.logger(e, "ERROR");
                    this.createException(e);
                });
        }

        /*
         *
         *	HTTP REQUEST FOR PROXY
         */
        httpRequestAction() {
            // hide debug bar
            this.hideDebugBar();
            //this.getResponse().setTimeout(5000)
            //return
            let Path = this.generateUrl("xmlAsyncResponse");
            let host = this.context.request.url.protocol + "//" + this.context.request.url.host + Path;
            let type = this.context.type;
            // cookie session
            let headers = {};
            if (this.context.session) {
                headers.Cookie = this.context.session.name + "=" + this.context.session.id;
            }
            let options = {
                hostname: this.context.request.url.hostname,
                port: this.context.request.url.port,
                path: Path,
                method: 'GET',
                headers: headers
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
                let certificats = this.get("httpsServer").getCertificats();
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

            let req = wrapper(options, (res) => {
                let bodyRaw = "";
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    this.logger(chunk, "DEBUG");
                    bodyRaw += chunk;
                });
                res.on('end', () => {
                    this.renderAsync("demoBundle:Default:httpRequest.html.twig", {
                        host: host,
                        type: type,
                        bodyRaw: bodyRaw,
                    });
                });
            });
            req.on('error', (e) => {
                this.logger('Problem with request: ' + e.message, "ERROR");
                this.renderAsync("demoBundle:Default:httpRequest.html.twig", {
                    host: host,
                    type: type,
                    bodyRaw: e,
                });
            });
            req.end();
        }

        /**
         *
         *	@method indexRealTimeAction
         *
         */
        indexRealTimeAction() {
            return this.render("demoBundle:realTime:index.html.twig", {
                title: "realTime"
            });
        }

        /*
         *
         *	UPLOAD
         *
         */
        indexUploadAction() {
            return this.render('demoBundle:demo:upload2.html.twig');
        }

        uploadAction() {

            let files = this.getParameters("query.files");
            let target = path.resolve(this.kernel.rootDir + "/" + "src", "bundles", "demoBundle", "Resources", "upload");

            for (let file in files) {
                if (files[file].error) {
                    throw files[file].error;
                }
                files[file].move(target);
                //console.log( files[file].getExtention() )
                //console.log( files[file].getMimeType() )
                //console.log( files[file].realName() )
            }
            if (!this.isAjax()) {
                return this.redirect(this.generateUrl("finder", {
                    queryString: {
                        "path": target
                    }
                }));
            } else {
                console.log(files)
                let res = {
                    "files": [],
                    "metas": []
                };
                for (let file in files) {
                    let name = files[file].realName();
                    res.files.push(target + "/" + name);
                    let meta = {
                        date: new Date(),
                        extention: files[file].getExtention(),
                        file: target + "/" + name,
                        name: name,
                        old_name: files[file].name,
                        size: files[file].stats.size,
                        size2: files[file].stats.size,
                        type: files[file].getMimeType().split("/")
                    };
                    res.metas.push(meta);
                }
                return this.renderResponse(
                    JSON.stringify(res),
                    200, {
                        'Content-Type': 'application/json; charset=utf-8'
                    }
                );
            }
        }
    };

    return demoController;
});
