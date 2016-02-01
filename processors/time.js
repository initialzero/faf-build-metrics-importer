var conf = require("config").get("conf"),
    log4js = require('log4js'),
    fs = require('fs'),
    request = require("request"),
    pgClient = require("../components/pgClient"),
    query = "INSERT INTO faf_metrics_build_time (" +
        "build_id, task_name, task_time" +
        ") VALUES ($1, $2, $3)";

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

            var queryArr = [],
                data,
                processed = [];

            try {
                data = JSON.parse(body);

                procLog.debug("Got timing data for job: ", job.name);

                // calc average data for repeated tasks
                data.forEach(function(item) {
                    if (typeof processed[item[0]] !== "undefined") {
                        processed[item[0]] = Math.round((processed[item[0]] + item[1]) / 2);
                    } else {
                        processed[item[0]] = item[1];
                    }
                });

                Object.keys(processed).forEach(function(key) {
                    queryArr.push([query, [build.build_id, key, processed[key]]]);
                });

                procLog.debug("Going to save timing data for job: ", job.name, [build.build_id, key, processed[key]]);

                pgClient.doQueryStack(queryArr).done(function(res) {
                    procLog.debug("Saved timing data for job: ", job.name);
                    callback(null, {time: data.length});
                }).fail(function(err){
                    procLog.error("Failed to save timing data for job: ", job.name);
                    callback(err);
                });

            } catch (e) {
                procLog.warn("Failed to get timing data for job: ", job.name);
                callback(error);
            }
        });
    }
};

