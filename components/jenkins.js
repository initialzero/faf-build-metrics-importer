var conf = require("config").get("conf"),
    Deferred = require('Deferred'),
    request = require('request'),
    argv = require("optimist").argv;

function buildJenkinsUrl(job, build) {
    var user = argv.u || conf.jenkins["usr"];
    var pwd = argv.p || conf.jenkins["pwd"];

    var url = "http://";

    if (user) {
        url = url + user;
        if (pwd) {
            url = url + ":" + pwd;
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
