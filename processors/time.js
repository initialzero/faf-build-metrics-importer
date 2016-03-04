var conf = require("config").get("conf"),
    log4js = require('log4js'),
    fs = require('fs'),
    request = require("request"),
    pgClient = require("../components/pgClient");

var procLog = log4js.getLogger("timeProcessor"),
    logFlow = log4js.getLogger("flow");

module.exports = {

    run: function(job, build, reportPath, callback) {

        procLog.debug("checking job: ", job.name);

        if(fs.existsSync(reportPath)) {

            fs.readFile(reportPath, 'utf8', function (error, body) {
                if (error) {
                    procLog.warn("Failed to get timing data for job: ", job.name);
                    callback(null, error);
                    return;
                }

                pgClient.saveTimeData(job, body, build, callback);
            });
        } else {
            logFlow.warn("File Time report not exists");
        }
    }
};

