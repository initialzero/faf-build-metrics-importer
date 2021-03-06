var conf = require("config").get("conf"),
    log4js = require('log4js'),
    request = require("request"),
    pgClient = require("../components/pgClient"),
    query = "INSERT INTO faf_metrics_build_time (" +
        "build_id, task_name, task_time" +
        ") VALUES ($1, $2, $3)";

var procLog = log4js.getLogger("timeProcessor");

function buildJenkinsUrl(job, path) {

    var url = "http://";

    if (conf.jenkins["usr"]) {
        url = url + conf.jenkins["usr"];
        if (conf.jenkins["pwd"]) {
            url = url + ":" + conf.jenkins["pwd"];
        }
        url = url + "@";
    }

    url = url + conf.jenkins["url"] + "/job/" + job + "/ws/" + path;

    return  url;
}

module.exports = {

    run: function(job, build, callback) {

        var urlToQueryJenkins = buildJenkinsUrl(job.name, "build/metrics/time.json");

        procLog.debug("checking job: ", job.name);

        request(urlToQueryJenkins, function(error, response, body) {
            if (error || response.statusCode !== 200) {
                procLog.warn("Failed to get timing data for job: ", job.name);
                callback(null, error || "responce: " + response.statusCode);
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

                procLog.debug("Going to save timing data for job: ", job.name);

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

