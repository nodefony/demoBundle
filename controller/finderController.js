/*
 *	CONTROLLER finder
 */
module.exports = class finderController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
  }

  indexAction() {
    let query = this.getParameters("query");
    let path = null;
    if (!query.get.path) {
      path = this.kernel.rootDir + "/src/bundles/demoBundle/Resources/images";
    } else {
      path = query.get.path;
    }
    // secure path
    let securePath = this.kernel.getBundles("demo").path;
    let reg = new RegExp("^" + securePath);
    if (!reg.test(path)) {
      throw {
        status: 401
      };
    }
    try {
      this.search(path);
    } catch (e) {
      throw e;
    }
  }

  downloadAction() {
    let path = null;
    let query = this.getParameters("query");
    if (!query.get.path) {
      throw new Error("Download Not path to host");
    } else {
      path = query.get.path;
    }
    let file = new nodefony.fileClass(path);

    try {
      return this.encode(file);
    } catch (e) {
      throw e;
    }
  }

  search(path) {
    //let response = null;
    try {
      var file = new nodefony.fileClass(path);
      switch (file.type) {
      case "symbolicLink":
      case "Directory":
        new nodefony.finder({
          path: path,
          json: true,
          followSymLink: true,
          //seeHidden:true,
          recurse: false,
          onDirectory: function (File /*, finder*/ ) {
            File.link = file.type;
          },
          onFile: function (File /*, finder*/ ) {
            switch (File.mimeType) {
            case "text/plain":
              File.link = "Link";
              break;
            default:
              File.link = "Download";
            }
          },
          onFinish: (error, files) => {
            this.renderAsync('demoBundle:finder:index.html.twig', {
              title: "Finder",
              files: files.json
            });
          }
        });
        break;
      case "File":
        switch (file.mimeType) {
        case "text/plain":
          this.renderAsync('demoBundle:finder:files.html.twig', {
            content: file.content(file.encoding),
            mime: file.mimeType,
            encoding: file.encoding
          });
          break;
        case "text/x-markdown":
          let res = this.htmlMdParser(file.content(file.encoding), {
            linkify: true,
            typographer: true
          });
          this.renderAsync('demoBundle:finder:files.html.twig', {
            title: file.name,
            content: res,
            mime: file.mimeType,
            encoding: file.encoding
          });
          break;
        default:
          this.encode(file);
        }
        break;
      }
    } catch (e) {
      throw e;
    }
  }

  encode(file) {
    switch (true) {

    case /^image/.test(file.mimeType):
    case /^video/.test(file.mimeType):
    case /^audio/.test(file.mimeType):
    case /application\/pdf/.test(file.mimeType):
      try {
        this.renderMediaStream(file);

      } catch (error) {
        switch (error.code) {
        case "EISDIR":
          error.message = file.path + " : is Directory";
          break;
        }
        throw error;
      }
      break;
      // download
    default:
      try {
        this.renderFileDownload(file);
      } catch (error) {
        switch (error.code) {
        case "EISDIR":
          error.message = file.path + " : is Directory";
          break;
        }
        throw error;
      }
    }
  }
};
