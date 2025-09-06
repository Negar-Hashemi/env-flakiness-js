if (process.env.JS_SANITIZER_DEBUG) {
  console.log("########### INDEX JS-ENV-SANITIZER #################");
}
module.exports = require("./sanitizer.js");
