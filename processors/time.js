var conf = require("config").get("conf"),
    request = require("request"),
    pgClient = require("../components/pgClient"),
    query = "INSERT INTO faf_metrics_build_time (" +
        "build_id, task_name, task_time" +
        ") VALUES ($1, $2, $3)";

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
        request(urlToQueryJenkins, function(error, response, body) {
            var queryArr = [],
                data,
                processed = [];
            try {
                data = JSON.parse(body);

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

                pgClient.doQueryStack(queryArr).done(function(res) {
                    callback(null, {time: data.length});
                }).fail(function(err){
                    callback(err);
                });
            } catch (e) {
                callback(error, { time: 0 });
            }
        });
    }
};

