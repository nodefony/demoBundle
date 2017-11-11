module.exports = class uploadController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
  }

  indexUploadAction() {
    return this.render('demoBundle:upload:upload.html.twig');
  }

  uploadAction() {
    let files = this.getParameters("query.files");
    let target = path.resolve(this.kernel.rootDir + "/" + "src", "bundles", "demoBundle", "Resources", "upload");
    for (let i = 0; i < files.length; i++) {
      files[i].move(target);
    }
    if (!this.isAjax()) {
      return this.redirect(this.generateUrl("finder", {
        queryString: {
          "path": target
        }
      }));
    } else {
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
