var conf = require("config").get("conf"),
    request = require('request');

module.exports = {
    get: function(jobName, buildId, callback) {
        request(url(jobName, buildId), function(err, response, body) {
            try {
                body = JSON.parse(body);
            } catch(e) {

            } finally {
                callback(err, body);
            }
        });
    }
};


function url(job, build) {
    var url = "http://" +
        conf.jenkins["usr"] + ":" +
        conf.jenkins["pwd"] + "@" +
        conf.jenkins["url"];
    if (job) {
        url += "/job/" + job;
        if (build) {
            url += "/" + build;
        }
    }
    return url + "/api/json";
}