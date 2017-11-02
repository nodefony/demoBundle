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

    /**
     *
     *	 ORM INSERT ENTITIES
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
  };
  return loginController;
});
