var fs = require("fs"),
    conf = require("config").get("conf"),
    log4js = require('log4js'),
    request = require("request"),
    pgClient = require("../components/pgClient"),
    query = "INSERT INTO faf_metrics_build_size (" +
        "build_id, file_name, file_size" +
        ") VALUES ($1, $2, $3)";

var procLog = log4js.getLogger("sizeProcessor");

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

    init: function(doneCallbackFunc) {

        pgClient.doQuery("SELECT * FROM faf_metrics_build_size LIMIT 1", [], true).fail(function () {

            // There is no table which needed for this module, so let's create it...
            procLog.info("Creating a table for 'faf_metrics_build_size' processor");

            fs.readFile("./config/db/size.sql", "ascii", function(err, createTableSQL) {
                pgClient.doQuery(createTableSQL, []).done(function(res) {
                    doneCallbackFunc();
                }).fail(doneCallbackFunc);
            });

        }).done(function(){
            doneCallbackFunc();
        });
    },

    run: function(job, build, callback) {
        var urlToQueryJenkins = buildJenkinsUrl(job.name, "build/metrics/size.json");
        procLog.debug("checking job: ", job.name);

        request(urlToQueryJenkins, function(error, response, body) {
            if (error || response.statusCode !== 200) {
                procLog.warn("Failed to get data for job: ", job.name);
                callback(null, error || "responce: " + response.statusCode);
                return;
            }

            var queryArr = [],
                data,
                processed = [];

            try {
                data = JSON.parse(body);

                procLog.debug("Got data for job: ", job.name);


                data.forEach(function(item) {
                    queryArr.push([query, [build.build_id, item.name, item.size]]);
                });

                procLog.debug("Going to save data for job: ", job.name);

                pgClient.doQueryStack(queryArr).done(function(res) {
                    procLog.debug("Saved data for job: ", job.name);
                    callback(null, {time: data.length});
                }).fail(function(err){
                    procLog.error("Failed to save data for job: ", job.name);
                    callback(err);
                });

            } catch (e) {
                procLog.warn("Failed to get data for job: ", job.name);
                callback(error);
            }
        });

    }
};
