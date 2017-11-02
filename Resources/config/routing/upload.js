module.exports = {
  upload: {
    pattern: "/upload",
    defaults: {
      controller: "demoBundle:upload:indexUpload"
    },
    requirements: {
      method: "GET"
    }
  },
  uploadFile: {
    pattern: "/fileupload",
    defaults: {
      controller: "demoBundle:upload:upload"
    },
    requirements: {
      method: "POST"
    }
  }
};
