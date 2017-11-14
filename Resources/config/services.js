module.exports = {
  dmsg: {
    class: nodefony.services.dmsg,
    arguments: ["@realTime", "@container", "@kernel"]
  },
  random: {
    class: nodefony.services.random,
    arguments: ["@realTime", "@container", "@kernel"]
  }
};
