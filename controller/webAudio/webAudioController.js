  /**
   *	The class is a **`default` CONTROLLER** .
   *	@module
   *	@main
   *	@class default
   *	@constructor
   *	@param {class} container
   *	@param {class} context
   *
   */
  module.exports = class webAudioController extends nodefony.controller {

    constructor(container, context) {
      super(container, context);
    }

    /**
     *
     *	@method mixAction
     *
     */
    mixAction() {
      return this.render("demoBundle:webAudio:mix2.html.twig");
    }
  };
