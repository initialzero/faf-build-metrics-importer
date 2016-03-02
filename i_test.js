/**
 * Created by valeriy.abornyev on 2/9/2016.
 */
var pgClient = require("./components/pgClient"),
    conf = require("config").get("conf"),
    async = require("async"),
    spawn = require("child_process").spawn,
    assert = require("assert"),
    size = require("./build/metrics/size"),
    time = require("./build/metrics/time"),
    coverage = require("./processors/coverage");

var dataFromXML = {
    functionsCovered: 0.45121951219512196,
    branchesCovered: 0.3832,
    linesCovered: 0.34646739130434784
};



var arrTables = ['faf_metrics_build_coverage', 'faf_metrics_build_size', 'faf_metrics_build_time', 'faf_metrics_build', 'faf_metrics_jenkins_jobs'];

pgClient.init().done(function() {
    async.series([
        function (callback) {
            checkDBRequest(callback);
        },
        function(callback) {
            var arrFunc = [];

            arrTables.forEach(function(item) {
                (function(item){
                    arrFunc.push(function(callback){
                        checkTable(item, callback);
                    });
                })(item);
            });

            async.parallel(arrFunc, callback);
        },
        function(callback) {
            var arrFunc = [];

            arrTables.forEach(function(item) {
                (function(item){
                    arrFunc.push(function(callback){
                        deleteTablesContent(item, callback);
                    });
                })(item);
            });

            async.series(arrFunc, callback);
        },
        function(callback) {
            var run  = spawn('node', ['main.js', '--job=module-jrs-ui-pro-trunk-jade-new-css-html',
                '--build=35', '--started=1447938126624', '--started_by=user name', '--result=SUCCESS', '--change_set=some text']);

            run.stdout.on('data', function (data) {
                console.log(data.toString());
            });

            run.stderr.on('data', function (data) {
                console.log('stderr: ' + data);
            });

            run.on('close', function() {
                console.log("child process exited");
                callback();
            });
        }
    ],
        function(err, results){

            async.parallel([
                    function(callback){
                        pgClient.doQuery("SELECT * FROM faf_metrics_build LIMIT 1").fail(function(err){
                            console.log(err);
                            callback(err);
                        }).done(function(data) {
                            assert.equal(data.rows[0].build, 35);
                            assert.deepEqual(new Date(data.rows[0].started), new Date(1447938126624));
                            assert.equal(data.rows[0].result, "SUCCESS");
                            assert.deepEqual(data.rows[0].change_set, '"some text"');
                            callback();
                        });
                    },
                    function(callback){
                        pgClient.doQuery("SELECT * FROM faf_metrics_jenkins_jobs LIMIT 1").fail(function(err){
                            console.log(err);
                            callback(err);
                        }).done(function(data) {
                            assert.equal(data.rows[0].job_name, "module-jrs-ui-pro-trunk-jade-new-css-html");
                            assert.equal(data.rows[0].module, "jrs-ui-pro");
                            assert.equal(data.rows[0].feature, "jade-new-css-html");
                            callback();
                        });
                    },
                    function(callback){
                        pgClient.doQuery("SELECT file_name, file_size FROM faf_metrics_build_size").fail(function(err){
                            console.log(err);
                            callback(err);
                        }).done(function(data) {
                            var dataLength = data.rows.length;
                            assert.equal(dataLength, size.length);
                            for(var i=0; i < dataLength; i++) {
                                assert.equal(data.rows[i].file_name, size[i].name);
                                assert.equal(data.rows[i].file_size, size[i].size);
                            }
                            callback();
                        });
                    },
                    function(callback){
                        pgClient.doQuery("SELECT task_name, task_time FROM faf_metrics_build_time").fail(function(err){
                            console.log(err);
                            callback(err);
                        }).done(function(data) {
                            var dataLength = data.rows.length;
                            assert.equal(dataLength, time.length);
                            for(var i=0; i < dataLength; i++) {
                                assert.equal(data.rows[i].task_name, time[i][0]);
                                assert.equal(data.rows[i].task_time, time[i][1]);
                            }
                            callback();
                        });
                    },
                    function(callback){
                        pgClient.doQuery("SELECT functionscovered, branchescovered, linescovered FROM faf_metrics_build_coverage").fail(function(err){
                            console.log(err);
                            callback(err);
                        }).done(function(data) {
                            var dataLength = data.rows.length;
                            for(var i=0; i < dataLength; i++) {
                                assert.equal(data.rows[i].functionscovered.toFixed(9), dataFromXML.functionsCovered.toFixed(9));
                                assert.equal(data.rows[i].branchescovered.toFixed(4), dataFromXML.branchesCovered.toFixed(4));
                                assert.equal(data.rows[i].linescovered.toFixed(9), dataFromXML.linesCovered.toFixed(9));
                            }
                            callback();
                        });
                    }
                ],
                function(err, results) {
                    process.exit();
                }
            );
    });
});

function checkDBRequest(callback) {
    pgClient.doQuery("SELECT * FROM pg_database LIMIT 1").fail(function(err){
        console.log(err);
        callback(err)
    }).done(function() {
        console.log('pg_database: request successful');
        callback();
    });
}

function checkTable(table, callback) {
    pgClient.doQuery("SELECT * FROM "+ table +" LIMIT 1").fail(function(err){
        console.log(err);
        callback(err)
    }).done(function(data) {
        console.log(table + ": request successful");
        callback();
    });
}

function deleteTablesContent(table, callback) {
    pgClient.doQuery("DELETE FROM "+ table).fail(function(err){
        console.log(err);
        callback(err)
    }).done(function() {
        console.log("drop table: " + table);
        callback();
    });
}


