var path = require("path"),
    processors = {};

require("fs").readdirSync(__dirname).forEach(function(file) {

    // include only '*.js' files
    if (!file.toString().match(/\.js$/)) {
        return;
    }
    // don't include 'index.js' file itself
    if (file === "index.js") {
        return;
    }

    processors[path.basename(file, ".js")] = require("./" + file);
});

module.exports = processors;