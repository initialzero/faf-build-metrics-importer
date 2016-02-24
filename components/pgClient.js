var pg = require('pg'),
    Deferred = require('Deferred'),
    async = require("async"),
    conf = require("config").get("conf"),
    log4js = require('log4js'),

    pgConnection,
    pgConnectionEstablished = false;


    log4js.configure(conf.log4js);
var logFlow = log4js.getLogger("flow");
var procLog = log4js.getLogger("timeProcessor");

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
    saveTimeData: saveTimeData,
    saveSizeData: saveSizeData,
    saveCoverageData: saveCoverageData,

    init: function() {

        var dfr = new Deferred();

        connect().done(function() {

            // connection established.
            // now, get from db lastBuildsProcessed
            doQuery(
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
            ).fail(function(err){

                // failed to make this request
                dfr.reject(err);
                    
            }).done(function(data) {

                var info = {};
                    data.rows.forEach(function(row) {
                    info[row.job_name] = row.build_id;
                });

                dfr.resolve(info);
            });

        }).fail(function(){
            // failed to establish connection thus failed to initialize
            dfr.reject();
        });

        return dfr;
    },

    saveJob: function(jobName, callback) {
        getJobId(jobName, function(err, jobId){
            if (!jobId && !err) {
                insertJob(jobName, function(err, jobId) {
                    callback(err, jobId);
                });
            } else {
                callback(err, jobId);
            }
        });
    },

    saveBuild: function(job, build) {

        var dfr = new Deferred();



        getBuildId(job.id, build.number, function(err, build_id) {
            var startedBy,
                changeSet;

            if (build_id) {
                dfr.resolve(build_id);
            } else {
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

                ]).done(function() {
                    getBuildId(job.id, build.number, function(err, build_id) {
                        dfr.resolve(build_id);
                    });
                }).fail(function(err){
                    dfr.reject(err);
                });
            }
        });



        return dfr;
    }
};


function doQuery (query, params, silent) {
    var dfr = new Deferred();
    silent = silent || false;
    pgConnection.query(query, params, function(err, result) {
        if (err) {
            if (!silent) {
                logFlow.error("Failed to make a request: '" + query + "', with params: '" + params + "'. The reason is: ", err);
            }
            dfr.reject();
            return;
        }
        dfr.resolve(result);
    });
    return dfr;
}

function doQueryStack(queryArr) {
    var dfr = new Deferred();
    async.each(queryArr, function(query, callback) {
        doQuery(
            query[0],
            query[1]
        ).done(function(res) {
                callback(null, res);
            }).fail(function(err) {
                callback(err);
            });
    }, function(err, res) {
        if (err) {
            dfr.reject(err);
        } else {
            dfr.resolve(res);
        }
    });

    return dfr;
}


function getJobId(jobName, callback) {
    doQuery("SELECT job_id FROM faf_metrics_jenkins_jobs WHERE job_name = $1", [jobName]).done(function(res) {
        var jobId = res && res.rows && res.rows[0] && res.rows[0].job_id;
        callback(null, jobId);
    }).fail(callback);
}
function insertJob(name, callback) {
    var module, feature, res;

    res = name.match(/^module-([\w-]+)-trunk[-]?([\w-\.]+)?$/);

    if (res === null) {
        module = feature = name;
    } else {
        module = res[1] || name;
        feature = res[2] || (name.match(/trunk$/) ? "trunk" : name);
    }

    doQuery(
        "INSERT INTO faf_metrics_jenkins_jobs (job_name, module, feature) VALUES ($1, $2, $3)",
        [name, module, feature]
    ).done(function(err,res) {
        getJobId(name, callback);
    }).fail(callback);
}


function getBuildId(job_id, build, callback) {
    doQuery(
        "SELECT build_id FROM faf_metrics_build WHERE job_id = $1 AND build = $2",
        [job_id, build]
    ).done(function(res) {
        var build_id = res && res.rows && res.rows[0] && res.rows[0].build_id;
        callback(null, build_id);
    }).fail(callback);
}

function saveTimeData(job, body, build, callback) {
    var query = "INSERT INTO faf_metrics_build_time (" +
        "build_id, task_name, task_time" +
        ") VALUES ($1, $2, $3)";

    var queryArr = [],
        data,
        processed = [];

    try {
        data = JSON.parse(body);

        procLog.debug("Got timing data for job: ", job.name);

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

        procLog.debug("Going to save timing data for job: ", job.name, queryArr);

        doQueryStack(queryArr).done(function(res) {
            procLog.debug("Saved timing data for job: ", job.name);
            callback(null, {time: data.length});
        }).fail(function(err){
            procLog.error("Failed to save timing data for job: ", job.name);
            callback(err);
        });

    } catch (e) {
        procLog.warn("Failed to get timing data for job: ", job.name);
        callback(e);
    }
}

function saveSizeData(job, body, build, callback) {
    query = "INSERT INTO faf_metrics_build_size (" +
        "build_id, file_name, file_size" +
        ") VALUES ($1, $2, $3)";

    var queryArr = [],
        data,
        processed = [];

    try {
        data = JSON.parse(body);

        procLog.debug("Got data for job: ", job.name);


        data.forEach(function(item) {
            queryArr.push([query, [build.build_id, item.name, item.size]]);
        });

        procLog.debug("Going to save data for job: ", job.name, queryArr);

        doQueryStack(queryArr).done(function(res) {
            procLog.debug("Saved data for job: ", job.name);
            callback(null, {time: data.length});
        }).fail(function(err){
            procLog.error("Failed to save data for job: ", job.name);
            callback(err);
        });

    } catch (e) {
        procLog.warn("Failed to get data for job: ", job.name);
        callback(e);
    }}

function saveCoverageData(job, build, statistic, callback) {
    var sql =
        "INSERT INTO faf_metrics_build_coverage (" +
        "build_id, " +
        "functionsCovered, " +
        "branchesCovered, " +
        "linesCovered) " +
        "VALUES ($1, $2, $3, $4)";

    doQuery(sql, [
        build.build_id,
        statistic.functionsCovered,
        statistic.branchesCovered,
        statistic.linesCovered
    ]).done(function () {
        procLog.debug("Saved coverage statistic for job ", job.name);
        callback(null, statistic);
    }).fail(function (err) {
        procLog.error("Failed to save coverage statistic for job ", job.name);
        callback(err);
    });
}