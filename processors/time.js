var conf = require("config").get("conf"),
    request = require("request"),
    pg = require("../components/pg"),
    query = "INSERT INTO faf_metrics_build_time (job_id, build, task_name, task_time) VALUES ($1, $2, $3, $4)";


module.exports = function(job, build, callback) {

    request(url(job.name, "build/metrics/time.json"), function(error, response, body) {
        var queryArr = [],
            data;
        try {
            data = JSON.parse(body);

            data.forEach(function(item) {
                queryArr.push([query, [job.id, build.number, item[0], item[1]]]);
            });
            pg.doQueryStack(queryArr, function(err, res) {
                callback(err, { time: data.length });
            });

        } catch (e) {
            callback(error, { time: 0 });
        }
    });

};

function url(job, path) {
    return "http://" +
        conf.jenkins["usr"] + ":" +
        conf.jenkins["pwd"] + "@" +
        conf.jenkins["url"] + "/job/" +
        job + "/ws/" + path;
}