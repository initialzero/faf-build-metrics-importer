var path = require("path"),
    processors = {};

require("fs").readdirSync(__dirname).forEach(function(file) {
    if (file === "index.js") {
        return;
    }
    processors[path.basename(file, ".js")] = require("./" + file);
});

module.exports = processors;