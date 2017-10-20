/*
 *
 *
 *
 *	CONTROLLER login
 *
 *
 *
 *
 */

module.exports = nodefony.registerController("login", function () {

    const loginController = class loginController extends nodefony.controller {

        constructor(container, context) {
            super(container, context);
        }

        /**
         *
         *	DEMO login
         *
         */
        loginAction(type) {
            let log = null;
            if (this.context.session) {
                log = this.context.session.getFlashBag("session");
                if (log) {
                    log.login = true;
                } else {
                    log = {
                        login: true
                    };
                }
                let error = this.context.session.getFlashBag("error");
                if (error) {
                    log.error = error;
                }
            }

            if (!log) {
                log = {};
            }

            switch (type) {
            case "nodefony-sasl":
                log.type = type;
                return this.render("demoBundle:login:login.html.twig", log);
            case "passport-local":
                log.type = type;
                return this.render("demoBundle:login:login.html.twig", log);
            default:
                return this.render("frameworkBundle::401.html.twig", log);
            }
        }

        subscribeAction() {
            if (!this.context.session) {
                this.startSession("default", (error, session) => {
                    if (error) {
                        throw error;
                    }
                    let log = session.getFlashBag("session");

                    if (log) {
                        log.login = true;
                    } else {
                        log = {
                            login: true
                        };
                    }
                    error = session.getFlashBag("error");
                    if (error) {
                        log.error = error;
                    }
                    let adduser = session.getFlashBag("adduser");
                    if (adduser) {
                        log.adduser = adduser;
                    }
                    this.renderAsync('demoBundle:login:subscribe.html.twig', log);
                });
            } else {
                let log = this.context.session.getFlashBag("session");
                if (log) {
                    log.login = true;
                } else {
                    log = {
                        login: true
                    };
                }
                let error = this.context.session.getFlashBag("error");
                if (error) {
                    log.error = error;
                }
                let adduser = this.context.session.getFlashBag("adduser");
                if (adduser) {
                    log.adduser = adduser;
                }
                return this.render('demoBundle:login:subscribe.html.twig', log);
            }
        }
    };
    return loginController;
});
