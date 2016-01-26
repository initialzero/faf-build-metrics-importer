var conf = require("config").get("conf"),
    argv = require('optimist').argv,
    log4js = require('log4js');


log4js.configure(conf.log4js);
var log = log4js.getLogger("main"),
    logFlow = log4js.getLogger("flow");


logFlow.info(argv);