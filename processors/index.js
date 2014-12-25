var path = require("path"),
    async = require("async"),
    Deferred = require("Deferred"),
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

function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

module.exports = {

    initAllProcessors: function() {
        var dfr = new Deferred();
        var initTasks = [];

        Object.keys(processors).forEach(function(type) {
            if (isFunction(processors[type].init)) {
                initTasks.push(processors[type].init);
            }
        });

        // run then all initialization tasks in parallel (yes, you are right, in 'pseudo' parallel)
        async.parallel(initTasks, function(){
            dfr.resolve();
        });

        return dfr;
    },

    getAllProcessors: function() {
        return processors;
    }
};
