var pg = require('pg'),
    async = require("async"),
    conf = require("config").get("conf"),

    pgClient,

    conString = "postgres://" + conf.pg["usr"] +
        ":" + conf.pg["pwd"] +
        "@" + conf.pg["host"] +
        "/" + conf.pg["db_name"];

function connect() {
    pgClient = new pg.Client(conString);
    pgClient.connect();
}

module.exports = {
    doQuery: doQuery,
    doQueryStack: doQueryStack,

    init: function(callback) {
        // connect
        if (!pgClient) {
            connect();
        }

        // get from db lastBuildsProcessed
        doQuery("SELECT jj.job_name, MAX(b.build) as build_id " +
            "FROM faf_metrics_build b, faf_metrics_jenkins_jobs jj " +
            "WHERE jj.job_id = b.job_id GROUP BY jj.job_name", [], function(err, res) {

            var info = {};
            res.rows.forEach(function(row) {
                info[row.job_name] = row.build_id;
            });
            callback(err, info);
        });
    },
    saveJob: function(job, callback) {
        getJobId(job.name, function(err, jobId){
            if (!jobId && !err) {
                insertJob(job.name, function(err, jobId) {
                    callback(err, jobId);
                });
            } else {
                callback(err, jobId);
            }
        });
    },
    saveBuild: function(job, build, callback) {
        var startedBy,
            changeSet = JSON.stringify(build.changeSet);

        try {
            startedBy = JSON.stringify(build.actions).match(/userId\":\"(\w+)/);
            startedBy.shift();
            startedBy = startedBy.join(", ");
        } catch (e) {
            startedBy = "CSM"
        }

        doQuery("INSERT INTO faf_metrics_build (" +
                "job_id, build, started, duration, started_by, result, change_set" +
                ") VALUES ($1, $2, $3, $4, $5, $6, $7) ", [
                    job.id,
                    build.number,
                    new Date(build.timestamp),
                    build.duration,
                    startedBy,
                    build.result,
                    changeSet
            ], function(err, res) {
                callback(err);
            });
    }
};


function doQuery(query, params, callback) {
    pgClient.query(query, params, callback);
}

function doQueryStack(queryArr, callback) {
    async.each(queryArr, function(query, callback) {
        doQuery(query[0], query[1], callback);
    }, callback);
}


function getJobId(jobName, callback) {
    doQuery("SELECT job_id FROM faf_metrics_jenkins_jobs WHERE job_name = $1", [jobName], function(err, res) {
        var jobId = res && res.rows && res.rows[0] && res.rows[0].job_id;
        callback(err, jobId);
    });
}
function insertJob(jobName, callback) {
    doQuery("INSERT INTO faf_metrics_jenkins_jobs (job_name) VALUES ($1)", [jobName], function(err,res) {
        getJobId(jobName, callback);
    });
}
