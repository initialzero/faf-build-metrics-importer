faf-build-metrics-importer
=======
This is a tool for importing, parsing and saving information about FAF build data from Jenkins CI jobs to some database for later analysis. It launches as a daemon and checks CI each 5 minutes (this value can be adjusted). Also this tool can process reports generated after CI has finished building some job.

Setting it up
=======

1\. After you cloned this repo and just downloaded sources of faf-build-metrics-importer, download all required node.js modules:
```
cd faf-build-metrics-importer
npm install
```

2\. Create a new database in PostreSQL. If you want, you can do this by next command:
```
psql -h localhost -U postgres -c "CREATE DATABASE <databaseName>;"
```

3\. After this, you need to import DB schema into your PostreSQL database:
```
psql -h <hostName> -U <userName> -d <databaseName> -f config/db_schema.sql
```

4\. Next, copy config file  from the sample and edit it with your own settings:
```
cp config/default.json.example config/default.json
```
The settings you need to declare are:
 * in **pg** key
  * database name -- required
  * database user name -- not required
  * database user password -- not required
 * in **jenkins** key
  * url of the Jenkins -- required
  * username -- not required
  * password -- not required

Usage
=======

The tool can be run via **main.js** script. The main idea behind script is ***checking new information from Jenkins***. Thus, it means what **main.js** should be launched as a daemon.

For the test run you can type next command:
```
node ./main.js
```
the sample output can be like this one:
```
$ node ./main.js 
[2014-12-19 10:45:11.683] [INFO] flow - Last build info:  {}
[2014-12-19 10:45:11.687] [INFO] flow - Start checking CI jobs...
[2014-12-19 10:45:11.687] [INFO] flow - Getting full list of jobs...
[2014-12-19 10:45:17.586] [INFO] flow - All done, sleeping for 300 seconds before next circle of checking...
```
Looks fine ! So, now it's time to put this command to some bash script and daemonize it.

Reports... what is this ?
==================
Report is a ....

How to add report
==================
- put file to folder "processors" 
`processors/newReport.js`
- create function which get, process and save data to database

```
var pg = require("../components/pg"); // Use postres module.

module.exports = function(job, build, callback) {
    // do all staff
    
    var reportData = "some report data";
    
    pg.doQuery("INSERT INTO new_report_table VALUES ($1, $2, $3)", [job.id, build.number, reportData], callback)
}
```




postres module
===============
Uses [node-postgres](https://github.com/brianc/node-postgres/wiki/Client#paramaterized-query-with-optional-callback-supplied). Has few methods.

##### doQuery
```
pg.doQuery("SELECT * FROM table WHERE id=$1", [12], callback);
```
##### doQueryStack
```
var queryArray = [
    ["INSERT INTO table VALUES ($1)", [123]],
    ["INSERT INTO table VALUES ($1)", [456]]
];

pg.doQueryStack(queryArray, callback);
```

TODO
=============
- redesign db
- refactor pg module, add getBuildId, getJobId
- log to file
- memory usage