module.exports = class uploadController extends nodefony.controller {
  constructor (container, context) {
    super(container, context);
  }

  indexUploadAction () {
    return this.render("demo-bundle:upload:upload.html.twig");
  }

  uploadAction () {
    const files = this.getParameters("query.files");
    const target = path.resolve(this.bundle.path, "Resources", "upload");
    for (let i = 0; i < files.length; i++) {
      files[i].move(target);
    }
    if (!this.isAjax()) {
      return this.redirect(this.generateUrl("finder", {
        queryString: {
          "path": target
        }
      }));
    }
    const res = {
      "files": [],
      "metas": []
    };
    for (const file in files) {
      const name = files[file].realName();
      res.files.push(`${target}/${name}`);
      const meta = {
        date: new Date(),
        extention: files[file].getExtention(),
        file: `${target}/${name}`,
        name,
        old_name: files[file].name,
        size: files[file].stats.size,
        size2: files[file].stats.size,
        type: files[file].getMimeType().split("/")
      };
      res.metas.push(meta);
    }
    return this.renderResponse(
      JSON.stringify(res),
      200,
      {
        "Content-Type": "application/json; charset=utf-8"
      }
    );
  }
};
