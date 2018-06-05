module.exports = {
  upload: {
    pattern: "/upload",
    defaults: {
      controller: "demo:upload:indexUpload"
    },
    requirements: {
      method: "GET"
    }
  },
  uploadFile: {
    pattern: "/fileupload",
    defaults: {
      controller: "demo:upload:upload"
    },
    requirements: {
      method: "POST"
    }
  }
};