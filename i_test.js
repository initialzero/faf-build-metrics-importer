/**
 * Created by valeriy.abornyev on 2/9/2016.
 */
var pgClient = require("./components/pgClient"),
    conf = require("config").get("conf"),
    async = require("async"),
    spawn = require('child_process').spawn;



var arrTabels = ['faf_metrics_build', 'faf_metrics_build_coverage', 'faf_metrics_build_size', 'faf_metrics_build_time', 'faf_metrics_jenkins_jobs'];

pgClient.init().done(function() {
    async.series([
        function (callback) {
            callback(null, checkDBRequest());
        },
        function(callback) {

            var checkAllTables = arrTabels.forEach(function(item) {
                checkTable(item);
            });
            callback(null, checkAllTables);
        },
        function(callback) {
            var delAllTables = arrTabels.forEach(function(item) {
                deleteTablesContent(item);
            });
            callback(null, delAllTables);
        },
        function(callback) {
            var run  = spawn('node', ['main.js', '--job=module-jrs-ui-pro-trunk-jade-new-css-html',
                '--build=35', '--started=1447938126624', '--started_by=user name', '--result=SUCCESS UNSTABLE FAILUR', '--change_set=some text']);

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
//console.log(results)
    });
});

function checkDBRequest() {
    pgClient.doQuery("SELECT * FROM pg_database LIMIT 1").fail(function(err){
        console.log(err);
    }).done(function(data) {
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
    }).done(function(item) {
        console.log("drop table: " + table);
    });
}

