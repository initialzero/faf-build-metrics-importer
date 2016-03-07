var fs = require("fs"),
    conf = require("config").get("conf"),
    log4js = require('log4js'),
    request = require("request"),
    pgClient = require("../components/pgClient");

var procLog = log4js.getLogger("sizeProcessor"),
    logFlow = log4js.getLogger("flow");

module.exports = {

    run: function(job, build, reportPath, callback) {
        procLog.debug("checking job: ", job.name);

        if(fs.existsSync(reportPath)) {
            fs.readFile(reportPath, "ascii", function(error, body) {
                if (error ) {
                    procLog.warn("Failed to get data for job: ", job.name);
                    callback(null, error);
                    return;
                }
                pgClient.saveSizeData(job, body, build, callback);

            });
        } else {
            callback("File size report don’t exists");
        }
    }
};
