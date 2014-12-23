var conf = require("config").get("conf"),
    request = require("request"),
    pgClient = require("../components/pgClient"),
    query = "INSERT INTO faf_metrics_build_time (job_id, build, task_name, task_time) VALUES ($1, $2, $3, $4)";

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

module.exports = function(job, build, callback) {

    var urlToQueryJenkins = buildJenkinsUrl(job.name, "build/metrics/time.json");

    request(urlToQueryJenkins, function(error, response, body) {
        var queryArr = [],
            data;
        try {
            data = JSON.parse(body);

            data.forEach(function(item) {
                queryArr.push([query, [job.id, build.number, item[0], item[1]]]);
            });
            pgClient.doQueryStack(queryArr, function(err, res) {
                callback(err, { time: data.length });
            });

        } catch (e) {
            callback(error, { time: 0 });
        }
    });

};
