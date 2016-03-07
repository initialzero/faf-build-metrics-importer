/**
 * Created by valeriy.abornyev on 3/7/2016.
 */
var conf = require("config").get("conf"),
    spawn = require("child_process").spawn;

var db_name = conf.pg.db_name,
    host = conf.pg.host,
    usr = conf.pg.usr;

function createDB() {
    var run = spawn('psql', ['--host=localhost', '--username=postgres', '--command=CREATE DATABASE "' + db_name + ';"']);

    run.stdout.on('data', function (data) {
        console.log(data.toString());
    });

    run.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });

    run.on('exit', function(code) {
        code || importDbToPostgre();
    });
}

function importDbToPostgre() {
    var run = spawn('psql', ['--host=' + host, '--username=' + usr, '--dbname=' + db_name, '--file=./config/db_schema.sql']);

    run.stdout.on('data', function (data) {
        console.log(data.toString());
    });

    run.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });
}

createDB();