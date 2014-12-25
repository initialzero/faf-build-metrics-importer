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

Making it Daemon
=======

The best way to make this service daemon, it to create a system service which will be launched during startup. We don't provide support for all operation systems, at least we support Ubuntu. So, read below how to make it.

### Ubuntu

1\. Became a root

2\. Copy init.d file and set proper execution rights:
```
cp init.d/ubuntu/faf-build-metrics-importer /etc/init.d/
chmod 775 /etc/init.d/faf-build-metrics-importer
```
and repace some variables inside this file:
 * WORKING_DIRECTORY=\<DIRECTORY\>
 * DAEMON=\<PATH_TO_NODE\>
 * USER_TO_RUN=\<USERNAME\>

3\. Set up the script for execution
```
update-rc.d faf-build-metrics-importer defaults 97 03
```
If you need to remove it from the launch list, you can use next command:
```
update-rc.d -f faf-build-metrics-importer remove
```

Processor
==================
Processor in terms of this application is a kind of a plugin which can be executed while recessing each CI job.
What does it mean ? Let's say there is a **processor** added bu someone.
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