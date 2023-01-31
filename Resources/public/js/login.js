module.exports = (function () {
  const handleLoginPageChangeBackground = function () {
    $("[data-click=\"change-bg\"]").on("click", function () {
      const targetImage = "[data-id=\"login-cover-image\"]";
      const targetImageSrc = $(this).find("img")
        .attr("src");
      const targetImageHtml = `<img src="${targetImageSrc}" data-id="login-cover-image" />`;

      $(".login-cover-image").prepend(targetImageHtml);
      $(targetImage).not(`[src="${targetImageSrc}"]`)
        .fadeOut("slow", function () {
          $(this).remove();
        });
      $("[data-click=\"change-bg\"]").closest("li")
        .removeClass("active");
      $(this).closest("li")
        .addClass("active");
    });
  };

  /* 05. Handle Page Load - Fade in
   	------------------------------------------------ */
  const handlePageContentView = function () {
    "use strict";
    $.when($("#page-loader").addClass("hide")).done(() => {
      $("#page-container").addClass("in");
    });
  };

  stage.appKernel.prototype.initializeLog = function (settings) {
    this.syslog.listenWithConditions(this, {
      severity: {
        data: "ERROR,INFO"
      }
    }, (pdu) => {
      if (pdu.payload.stack) {
        console.error(`SYSLOG ${pdu.severityName} ${pdu.msgid} ${new Date(pdu.timeStamp)} ${pdu.msg} : ${pdu.payload.stack}`);
      } else {
        $.gritter.add({
          title: `NODEFONY ${pdu.severityName}`,
          text: pdu.payload
        });
      }
    });

    this.syslog.listenWithConditions(this, {
      severity: {
        data: "CRITIC,WARNING,DEBUG "
      }
    }, (pdu) => {
      switch (pdu.severityName) {
      case "CRITIC":
        console.error(`SYSLOG ${pdu.severityName} ${pdu.msgid} ${new Date(pdu.timeStamp)} ${pdu.msg} : ${pdu.payload}`);
        break;
      case "WARNING":
        console.warn(`SYSLOG ${pdu.severityName} ${pdu.msgid} ${new Date(pdu.timeStamp)} ${pdu.msg} : ${pdu.payload}`);
        break;
      case "DEBUG":
        console.log(`SYSLOG ${pdu.severityName} ${pdu.msgid} ${new Date(pdu.timeStamp)} ${pdu.msg} : ${pdu.payload}`);
        break;
      }
    });

    return this.syslog;
  };
  const kernel = new stage.appKernel("dev", {
    debug: true,
    router: false,

    onBoot (kernel) {
      // this.login = new stage.login(this, $("#login"));
    },
    onDomLoad () {
      try {
        handleLoginPageChangeBackground();
      } catch (e) {
        console.log(e);
      }
    },
    onDomReady () {
      const error = $("#error");
      if (error.length) {
        const message = error.html();
        $("#error").remove();
        if (message !== "Missing credentials") {
          this.logger(message, "ERROR");
        }
      }

      const adduser = $("#adduser").html();
      if (adduser) {
        $("#adduser").remove();
        this.logger(adduser, "INFO");
      }

      switch (loginType) {
      case "passport-local":
        break;
      default:
        this.logger("FACTOY AUTHENTICATION : loginType NOT EXIST");
      }
      handlePageContentView();
    }
  });
  return kernel;
}());
