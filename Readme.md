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

2\. Copy config file  from the sample and edit it with your own settings:
```
cp config/default.json.example config/default.json
```

3\. After this, you need create a new database in PostreSQL and import DB schema into your PostreSQL database, you can do this by next command:
```
npm run setup-db
```


The settings you need to declare are:
 * in **pg** key
  * database name -- required
  * database user name -- not required
  * database user password -- not required

Usage
=======

The tool can be run via **main.js** script.

**Require arguments `--job=<job name> --build=<id build> --started=<timestamp>(1447938126624) --started-by=<user name> --result=<SUCCESS UNSTABLE FAILURE> --change-set=<text> --coverage-report-path=<path to coverage report> --time-report-path=<path to time report> --size-report-path=<path to size report>` 

For the test run you can type next command:
```
node ./main --job=<job name> --build=<id build> --started=<timestamp>(1447938126624) --started-by=<user name> --result=<SUCCESS UNSTABLE FAILURE> --change-set=<text> --coverage-report-path=<path to coverage report> --time-report-path=<path to time report> --size-report-path=<path to size report>
```
the output can be like this one:
```
$ node ./main.js --job=module-jrs-ui-pro-trunk-jade-new-css-html --build=35 --started=1447938126624 --started-by=user name --result=SUCCESS --change-set=some text --coverage-report-path=./build/metrics/cobertura-coverage.xml --time-report-path=./build/metrics/time.json --size-report-path=./build/metrics/size.json
[2016-03-07 16:17:19.733] [INFO] flow - Going to initialize processors...
[2016-03-07 16:17:19.734] [INFO] flow - Processors have been initialized, so let's continue
[2016-03-07 16:17:19.734] [INFO] flow - Job name received, run import for: module-jrs-ui-pro-trunk-jade-new-css-html
[2016-03-07 16:17:20.142] [INFO] flow - Finish
[2016-03-07 16:17:20.142] [INFO] flow - All done.
```
Looks fine ! So, now it's time to put this command to some bash script and daemonize it.

Processor
==================
Processor in terms of this application is a kind of a plugin which can be executed while recessing each CI job.
What does it mean ? Let's say there is a **processor** added by someone.
So, at some moment application will call this **processor** with parameters **job** and **build**  which will describe the
CI Job and the current build information of this job.
And the **processor** can do any actions it wants on this job.

Seems easy, right ?

Now, let's see how to add such processors

How to add a processor
==================
1\. Copy an empty skeleton of processor and name it like you want, for example:
```
cp processors/skeleton.js.example processors/myProcessor.js
```

2\. Modify the processor like you want...

3\. Extend pgClient with method which will save fetched data to db


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
- there is a file **config/update_job_names.sql** which if not used anywhere...
- redesign db
- refactor pg module, add getBuildId, getJobId
- memory usage