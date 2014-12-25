var conf = require("config").get("conf"),
    log4js = require('log4js'),
    request = require("request"),
    pgClient = require("../components/pgClient"),
    query = "INSERT INTO faf_metrics_build_time (" +
        "build_id, task_name, task_time" +
        ") VALUES ($1, $2, $3)";

log4js.configure(conf.log4js);
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

        procLog.info("checking job: ", job.displayName);

        request(urlToQueryJenkins, function(error, response, body) {
            var queryArr = [],
                data,
                processed = [];
            try {
                data = JSON.parse(body);

                procLog.info("Got timing data for job: ", job.displayName);

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

                procLog.info("Going to save timing data for job: ", job.displayName);

                pgClient.doQueryStack(queryArr).done(function(res) {
                    procLog.info("Saved timing data for job: ", job.displayName);
                    callback(null, {time: data.length});
                }).fail(function(err){
                    procLog.info("Failed to save timing data for job: ", job.displayName);
                    callback(err);
                });

            } catch (e) {
                procLog.info("Failed to get timing data for job: ", job.displayName);
                callback(error, { time: 0 });
            }
        });
    }
};

