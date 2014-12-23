var conf = require("config").get("conf"),
    Deferred = require('Deferred'),
    request = require('request');

function buildJenkinsUrl(job, build) {

    var url = "http://";

    if (conf.jenkins["usr"]) {
        url = url + conf.jenkins["usr"];
        if (conf.jenkins["pwd"]) {
            url = url + ":" + conf.jenkins["pwd"];
        }
        url = url + "@";
    }

    url = url + conf.jenkins["url"];

    if (job) {
        url += "/job/" + job;
        if (build) {
            url += "/" + build;
        }
    }

    url = url + "/api/json";

    return  url;
}

module.exports = {

    get: function(jobName, buildId) {
        
        var dfr = new Deferred(),
            urlToQueryJenkins = buildJenkinsUrl(jobName, buildId);
        
        request(urlToQueryJenkins, function(error, response, body) {

            if (error || response.statusCode != 200) {
                dfr.rejectWith(this, [error || "Response code is " + response.statusCode]);
                return;
            }

            try {
                body = JSON.parse(body);
            } catch(e) {

            } finally {
                dfr.resolveWith(this, [body]);
            }
        });
        
        return dfr;
    }
};
