const fs = require("fs")

const { log } = require("./utils")

function writeJsonToFile(json, path) {
  fs.writeFile(path, JSON.stringify(json, null, 2), (e) => {
    if (e == null) {
      console.log(`Finished writing to '${path}'`)
    } else {
      log(e)
    }
  });
}

module.exports.writeJsonToFile = writeJsonToFile