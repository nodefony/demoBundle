/*
 *	CONTROLLER login
 */

module.exports = class loginController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.startSession();
  }

  /**
   *
   *	DEMO login
   *
   */
  loginAction(type) {
    let log = {};
    if (this.context.session) {
      let error = this.context.session.getFlashBag("error");
      if (error) {
        log.error = error;
      }
    }
    switch (type) {
    case "passport-local":
      log.type = type;
      return this.render("demoBundle:login:login.html.twig", log);
    default:
      return this.render("frameworkBundle::401.html.twig", log);
    }
  }

  subscribeAction() {
    let log = {};
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

    // GET FACTORY SECURE TO ENCRYPTE PASSWORD
    //let firewall = this.get("security");
    //let area = firewall.getSecuredArea("demo_area") ;
    //let factory = area.getFactory();
    //let realm = factory.settings.realm ;
    //let cryptpwd = factory.generatePasswd(realm, query.post.usernameCreate, query.post.passwordCreate);
    return userEntity.create({
        username: query.post.usernameCreate,
        email: query.post.emailCreate,
        password: query.post.passwordCreate,
        name: query.post.nameCreate,
        surname: query.post.surnameCreate,
      })
      .then((results) => {
        users = results;
        return this.getSession().invalidate();
      })
      .then(() => {
        this.setFlashBag("adduser", " Add user  : " + query.post.usernameCreate + " OK");
        return this.redirect(this.generateUrl("demo"));
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

};