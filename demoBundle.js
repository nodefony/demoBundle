module.exports = nodefony.registerBundle("demo", function () {
  const demo = class demo extends nodefony.Bundle {
    constructor(name, kernel, container) {
      super(name, kernel, container);
    }
  };
  return demo;
});
