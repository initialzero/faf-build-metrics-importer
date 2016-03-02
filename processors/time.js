var conf = require("config").get("conf"),
    log4js = require('log4js'),
    fs = require('fs'),
    request = require("request"),
    pgClient = require("../components/pgClient");

var procLog = log4js.getLogger("timeProcessor");

module.exports = {

    run: function(job, build, callback) {

        procLog.debug("checking job: ", job.name);

        fs.readFile("build/metrics/time.json", 'utf8', function(error,  body) {
            if (error) {
                procLog.warn("Failed to get timing data for job: ", job.name);
                callback(null, error);
                return;
            }

            pgClient.saveTimeData(job, body, build, callback);
        });
    }
};

