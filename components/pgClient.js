var pg = require('pg'),
    Deferred = require('Deferred'),
    async = require("async"),
    conf = require("config").get("conf"),
    log4js = require('log4js'),

    pgConnection,
    pgConnectionEstablished = false;


log4js.configure(conf.log4js);
var logFlow = log4js.getLogger("flow");

function connect() {
    var dfr = new Deferred();

    // check the connection
    if (pgConnectionEstablished) {
        return dfr.resolve();
    }
    // if not connected, let's connect to server

    /// build the connection URL
    var conString = "postgres://";
    if (conf.pg["usr"]) {
        conString = conString + conf.pg["usr"];
        if (conf.pg["pwd"]) {
            conString = conString + ":" + conf.pg["pwd"];
        }
        conString = conString + "@";
    }
    conString = conString + conf.pg["host"] + "/" + conf.pg["db_name"];

    // make connection
    pgConnection = new pg.Client(conString);
    pgConnection.connect(function(err) {

        if (err) {
            logFlow.error("Failed to connect to PostgreSQL server: ", err);
            dfr.reject();
            return;
        }

        pgConnectionEstablished = true;
        dfr.resolve();
    });

    return dfr;
}

module.exports = {
    doQuery: doQuery,
    doQueryStack: doQueryStack,

    init: function() {

        var dfr = new Deferred();

        connect().done(function() {

            // connection established.
            // now, get from db lastBuildsProcessed
            doQueryDfr(
                "SELECT " +
                    "jj.job_name," +
                    "MAX(b.build) as build_id " +
                "FROM " +
                    "faf_metrics_build b, " +
                    "faf_metrics_jenkins_jobs as jj " +
                "WHERE " +
                    "jj.job_id = b.job_id " +
                "GROUP BY " +
                    "jj.job_name", []
            ).fail(function(){

                // failed to make this request
                dfr.reject();
                    
            }).done(function(data) {

                var info = {};
                    data.rows.forEach(function(row) {
                    info[row.job_name] = row.build_id;
                });

                dfr.resolveWith(this, [info]);
            });

        }).fail(function(){
            // failed to establish connection thus failed to initialize
            dfr.reject();
        });

        return dfr;
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

    saveBuild: function(job, build) {
        
        var dfr = new Deferred(),
            startedBy,
            changeSet = JSON.stringify(build.changeSet);

        try {
            startedBy = JSON.stringify(build.actions).match(/userId\":\"(\w+)/);
            startedBy.shift();
            startedBy = startedBy.join(", ");
        } catch (e) {
            startedBy = "CSM"
        }

        doQueryDfr("INSERT INTO faf_metrics_build (" +
            "job_id, build, started, duration, started_by, result, change_set" +
            ") VALUES ($1, $2, $3, $4, $5, $6, $7) ", [
                job.id,
                build.number,
                new Date(build.timestamp),
                build.duration,
                startedBy,
                build.result,
                changeSet
        
        ]).done(function() {
            dfr.resolve();
        }).fail(function(){
            dfr.reject();
        });

        return dfr;
    }
};


function doQuery(query, params, callback) {
    pgConnection.query(query, params, callback);
}

function doQueryDfr (query, params) {
    var dfr = new Deferred();
    pgConnection.query(query, params, function(err, result) {
        if (err) {
            logFlow.error("Failed to make a request: '" + query + "'. The reason is: ", err);
            dfr.reject();
            return;
        }
        dfr.resolveWith(this, [result]);
    });
    return dfr;
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
