/*
 *	CONTROLLER login
 */

module.exports = class loginController extends nodefony.controller {
  constructor (container, context) {
    super(container, context);
    this.startSession();
  }

  /**
   *
   *	DEMO login
   *
   */
  loginAction (type) {
    const log = {};
    if (this.context.session) {
      const error = this.context.session.getFlashBag("error");
      if (error) {
        log.error = error;
      }
    }
    switch (type) {
    case "passport-local":
      log.type = type;
      return this.render("demo:login:login.html.twig", log);
    default:
      return this.render("framework::401.html.twig", log);
    }
  }
};
