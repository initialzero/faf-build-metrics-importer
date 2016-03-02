var fs = require("fs"),
    conf = require("config").get("conf"),
    log4js = require('log4js'),
    request = require("request"),
    pgClient = require("../components/pgClient");

var procLog = log4js.getLogger("sizeProcessor");

module.exports = {

    run: function(job, build, callback) {
        procLog.debug("checking job: ", job.name);

        fs.readFile("build/metrics/size.json", "ascii", function(error, body) {
            if (error ) {
                procLog.warn("Failed to get data for job: ", job.name);
                callback(null, error);
                return;
            }
            pgClient.saveSizeData(job, body, build, callback);

        });

    }
};
