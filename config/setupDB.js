/**
 * Created by valeriy.abornyev on 3/7/2016.
 */
var conf = require("config").get("conf"),
    spawn = require("child_process").spawn;

var db_name = conf.pg.db_name,
    host = conf.pg.host,
    usr = conf.pg.usr;


var run = spawn('psql', ['-h', 'localhost', '-U', 'postgres', '-c', '"CREATE DATABASE' + db_name + ';"']);

run.stdout.on('data', function (data) {
    console.log(data.toString());
});

run.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
});