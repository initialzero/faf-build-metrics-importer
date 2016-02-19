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
            callback(null, checkDBRequest());
        },
        function(callback) {

            var checkAllTables = arrTables.forEach(function(item) {
                checkTable(item);
            });
            callback(null, checkAllTables);
        },
        function(callback) {
            var delAllTables = arrTables.forEach(function(item) {
                deleteTablesContent(item);
            });
            callback(null, delAllTables);
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
            callback(null, run);
        }
    ],
        function(err, results){
    });
});

function checkDBRequest() {
    pgClient.doQuery("SELECT * FROM pg_database LIMIT 1").fail(function(err){
        console.log(err);
    }).done(function() {
        console.log('pg_database: request successful');
    });
}

function checkTable(table) {
    pgClient.doQuery("SELECT * FROM "+ table +" LIMIT 1").fail(function(err){
        console.log(err);
    }).done(function(data) {
        console.log(table + ": request successful");
    });
}

function deleteTablesContent(table) {
    pgClient.doQuery("DELETE FROM "+ table).fail(function(err){
        console.log(err);
    }).done(function() {
        console.log("drop table: " + table);
    });
}


    pgClient.doQuery("SELECT * FROM faf_metrics_build LIMIT 1").fail(function(err){
        console.log(err);
    }).done(function(data) {
        assert.equal(data.rows[0].build, 35);
        assert.equal(data.rows[0].started, 'Thu Nov 19 2015 15:02:06 GMT+0200 (FLE Standard Time)');
        assert.equal(data.rows[0].result, "SUCCESS");
        assert.equal(data.rows[0].change_set, '"some text"');
    });

    pgClient.doQuery("SELECT * FROM faf_metrics_jenkins_jobs LIMIT 1").fail(function(err){
        console.log(err);
    }).done(function(data) {
        assert.equal(data.rows[0].job_name, "module-jrs-ui-pro-trunk-jade-new-css-html");
        assert.equal(data.rows[0].module, "jrs-ui-pro");
        assert.equal(data.rows[0].feature, "jade-new-css-html");
    });

    pgClient.doQuery("SELECT file_name, file_size FROM faf_metrics_build_size").fail(function(err){
        console.log(err);
    }).done(function(data) {
        var dataLength = data.rows.length;
        assert.equal(dataLength, size.length);
        for(var i=0; i < dataLength; i++) {
            assert.equal(data.rows[i].file_name, size[i].name);
            assert.equal(data.rows[i].file_size, size[i].size);
        }
    });

    pgClient.doQuery("SELECT task_name, task_time FROM faf_metrics_build_time").fail(function(err){
        console.log(err);
    }).done(function(data) {
        var dataLength = data.rows.length;
        assert.equal(dataLength, time.length);
        for(var i=0; i < dataLength; i++) {
            assert.equal(data.rows[i].task_name, time[i][0]);
            assert.equal(data.rows[i].task_time, time[i][1]);
        }
    });

    pgClient.doQuery("SELECT functionscovered, branchescovered, linescovered FROM faf_metrics_build_coverage").fail(function(err){
        console.log(err);
    }).done(function(data) {
        var dataLength = data.rows.length;
        for(var i=0; i < dataLength; i++) {
            assert.equal(data.rows[i].functionscovered.toFixed(9), dataFromXML.functionsCovered.toFixed(9));
            assert.equal(data.rows[i].branchescovered.toFixed(4), dataFromXML.branchesCovered.toFixed(4));
            assert.equal(data.rows[i].linescovered.toFixed(9), dataFromXML.linesCovered.toFixed(9));
        }
    });