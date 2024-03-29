/*
 *	CONTROLLER finder
 */
module.exports = class finderController extends nodefony.controller {
  constructor (container, context) {
    super(container, context);
  }

  indexAction () {
    const query = this.getParameters("query");
    let Path = null;
    if (!query.get.path) {
      Path = path.resolve(this.bundle.path, "Resources", "images");
    } else {
      Path = query.get.path;
    }
    // secure path
    const securePath = this.kernel.getBundles("demo").path;
    const reg = new RegExp(`^${securePath}`);
    if (!reg.test(Path)) {
      return this.createUnauthorizedException(`Unauthorized Path : ${Path}`);
    }
    try {
      return this.search(Path);
    } catch (e) {
      throw e;
    }
  }

  downloadAction () {
    let path = null;
    const query = this.getParameters("query");
    if (!query.get.path) {
      throw new Error("Download Not path to host");
    } else {
      path = query.get.path;
    }
    const file = new nodefony.fileClass(path);

    try {
      return this.encode(file);
    } catch (e) {
      throw e;
    }
  }

  search (path) {
    // let response = null;
    try {
      const file = new nodefony.fileClass(path);
      switch (file.type) {
      case "symbolicLink":
      case "Directory":
        return new Promise((resolve, reject) => {
          new nodefony.finder({
            path,
            json: true,
            followSymLink: true,
            // seeHidden:true,
            recurse: false,
            onDirectory (File /* , finder*/) {
              File.link = file.type;
            },
            onFile (File /* , finder*/) {
              switch (File.mimeType) {
              case "text/plain":
                File.link = "Link";
                break;
              default:
                File.link = "Download";
              }
            },
            onFinish: (error, files) => {
              if (error) {
                return reject(error);
              }
              return resolve(this.render("demo-bundle:finder:index.html.twig", {
                title: "Finder",
                files: files.json
              }));
            }
          });
        });
      case "File":
        switch (file.mimeType) {
        case "text/plain":
          return this.render("demo-bundle:finder:files.html.twig", {
            content: file.content(file.encoding),
            mime: file.mimeType,
            encoding: file.encoding
          });
        case "text/x-markdown":
          const res = this.htmlMdParser(file.content(file.encoding), {
            linkify: true,
            typographer: true
          });
          return this.render("demo-bundle:finder:files.html.twig", {
            title: file.name,
            content: res,
            mime: file.mimeType,
            encoding: file.encoding
          });
        default:
          this.encode(file);
        }
        break;
      }
    } catch (e) {
      throw e;
    }
  }

  encode (file) {
    switch (true) {
    case (/^image/).test(file.mimeType):
    case (/^video/).test(file.mimeType):
    case (/^audio/).test(file.mimeType):
    case (/application\/pdf/).test(file.mimeType):
      try {
        this.renderMediaStream(file);
      } catch (error) {
        switch (error.code) {
        case "EISDIR":
          error.message = `${file.path} : is Directory`;
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
          error.message = `${file.path} : is Directory`;
          break;
        }
        throw error;
      }
    }
  }
};
