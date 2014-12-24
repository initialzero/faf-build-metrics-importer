--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: faf_metrics_build; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE faf_metrics_build (
    build_id integer NOT NULL,
    job_id integer NOT NULL,
    build integer NOT NULL,
    started timestamp without time zone NOT NULL,
    duration integer,
    started_by text,
    result text,
    change_set text
);


--
-- Name: faf_metrics_build_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE faf_metrics_build_build_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: faf_metrics_build_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE faf_metrics_build_build_id_seq OWNED BY faf_metrics_build.build_id;


--
-- Name: faf_metrics_build_time; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE faf_metrics_build_time (
    id integer NOT NULL,
    build_id integer NOT NULL,
    task_name text NOT NULL,
    task_time integer NOT NULL
);


--
-- Name: faf_metrics_build_time_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE faf_metrics_build_time_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: faf_metrics_build_time_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE faf_metrics_build_time_id_seq OWNED BY faf_metrics_build_time.id;


--
-- Name: faf_metrics_jenkins_jobs; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE faf_metrics_jenkins_jobs (
    job_id integer NOT NULL,
    job_name text NOT NULL,
    module text NOT NULL,
    feature text NOT NULL
);


--
-- Name: faf_metrics_jenkins_jobs_job_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE faf_metrics_jenkins_jobs_job_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: faf_metrics_jenkins_jobs_job_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE faf_metrics_jenkins_jobs_job_id_seq OWNED BY faf_metrics_jenkins_jobs.job_id;


--
-- Name: build_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY faf_metrics_build ALTER COLUMN build_id SET DEFAULT nextval('faf_metrics_build_build_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY faf_metrics_build_time ALTER COLUMN id SET DEFAULT nextval('faf_metrics_build_time_id_seq'::regclass);


--
-- Name: job_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY faf_metrics_jenkins_jobs ALTER COLUMN job_id SET DEFAULT nextval('faf_metrics_jenkins_jobs_job_id_seq'::regclass);


--
-- Data for Name: faf_metrics_build; Type: TABLE DATA; Schema: public; Owner: -
--

COPY faf_metrics_build (build_id, job_id, build, started, duration, started_by, result, change_set) FROM stdin;
1	1	35	2014-12-18 08:39:09.263	5861	CSM	FAILURE	{"items":[{"affectedPaths":["CHANGELOG.md","bower.json","src/require.config.js"],"author":{"absoluteUrl":"http://build-master-fafj.jaspersoft.com/user/inesterenko","fullName":"Igor Nesterenko"},"commitId":"141","timestamp":1418884504442,"date":"2014-12-18T06:35:04.442542Z","msg":"updated changelog, prepared to create tag, switched proper version of js-sdk","paths":[{"editType":"edit","file":"/trunk/CHANGELOG.md"},{"editType":"edit","file":"/trunk/bower.json"},{"editType":"edit","file":"/trunk/src/require.config.js"}],"revision":141,"user":"Igor Nesterenko"}],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/bi-control/trunk","revision":141}]}
2	2	65	2014-12-24 11:59:00.305	155	CSM	SUCCESS	{"items":[],"kind":null}
3	3	17	2014-10-28 20:56:37	44297	CSM	FAILURE	{"items":[{"affectedPaths":["","src","src/bi/control/view/control/SingleValueDateControlView.js","src/bi/control/view/control/SingleValueDatetimeControlView.js","src/bi/control/view/control/SingleValueTimeControlView.js"],"author":{"absoluteUrl":"http://build-master-fafj.jaspersoft.com/user/inesterenko","fullName":"Igor Nesterenko"},"commitId":"83","timestamp":1414522317752,"date":"2014-10-28T18:51:57.752411Z","msg":"downmerged from trunk","paths":[{"editType":"edit","file":"/branches/amber-visualize"},{"editType":"edit","file":"/branches/amber-visualize/src"},{"editType":"edit","file":"/branches/amber-visualize/src/bi/control/view/control/SingleValueDateControlView.js"},{"editType":"edit","file":"/branches/amber-visualize/src/bi/control/view/control/SingleValueDatetimeControlView.js"},{"editType":"edit","file":"/branches/amber-visualize/src/bi/control/view/control/SingleValueTimeControlView.js"}],"revision":83,"user":"Igor Nesterenko"}],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/bi-control/branches/amber-visualize","revision":83}]}
4	4	2	2014-12-17 15:19:09.633	32184	CSM	SUCCESS	{"items":[{"affectedPaths":["bower.json"],"author":{"absoluteUrl":"http://build-master-fafj.jaspersoft.com/user/inesterenko","fullName":"Igor Nesterenko"},"commitId":"140","timestamp":1418822128206,"date":"2014-12-17T13:15:28.206975Z","msg":"-wired project through bower configs\\n-set proper names for overlays","paths":[{"editType":"edit","file":"/branches/amber-2-jive-refactoring/bower.json"}],"revision":140,"user":"Igor Nesterenko"}],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/bi-control/branches/amber-2-jive-refactoring","revision":140}]}
5	5	255	2014-12-18 09:01:09.364	53065	CSM	SUCCESS	{"items":[{"affectedPaths":["CHANGELOG.md","bower.json"],"author":{"absoluteUrl":"http://build-master-fafj.jaspersoft.com/user/inesterenko","fullName":"Igor Nesterenko"},"commitId":"1063","timestamp":1418886040641,"date":"2014-12-18T07:00:40.641142Z","msg":"updated changelog, prepared to create tag, switched proper version of other packages","paths":[{"editType":"edit","file":"/trunk/CHANGELOG.md"},{"editType":"edit","file":"/trunk/bower.json"}],"revision":1063,"user":"Igor Nesterenko"}],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/bi-dashboard/trunk","revision":1063}]}
6	6	2	2014-12-17 15:20:09.655	62542	CSM	SUCCESS	{"items":[{"affectedPaths":["bower.json"],"author":{"absoluteUrl":"http://build-master-fafj.jaspersoft.com/user/inesterenko","fullName":"Igor Nesterenko"},"commitId":"1062","timestamp":1418822112510,"date":"2014-12-17T13:15:12.510283Z","msg":"-wired project through bower configs\\n-set proper names for overlays","paths":[{"editType":"edit","file":"/branches/amber-2-jive-refactoring/bower.json"}],"revision":1062,"user":"Igor Nesterenko"}],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/bi-dashboard/branches/amber-2-jive-refactoring","revision":1062}]}
7	7	60	2014-12-18 08:58:09.348	27056	CSM	SUCCESS	{"items":[{"affectedPaths":["CHANGELOG.md","bower.json"],"author":{"absoluteUrl":"http://build-master-fafj.jaspersoft.com/user/inesterenko","fullName":"Igor Nesterenko"},"commitId":"2892","timestamp":1418885618267,"date":"2014-12-18T06:53:38.267188Z","msg":"updated changelog, prepared to create tag, switched proper version of js-sdk","paths":[{"editType":"edit","file":"/trunk/CHANGELOG.md"},{"editType":"edit","file":"/trunk/bower.json"}],"revision":2892,"user":"Igor Nesterenko"}],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/bi-report/trunk","revision":2892}]}
8	8	4	2014-12-22 14:33:39.147	32574	inesterenko	SUCCESS	{"items":[],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/bi-report/branches/amber-2-jive-refactoring","revision":2894}]}
9	9	36	2014-11-04 22:08:41	37840	nmarcu	SUCCESS	{"items":[],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/bi-report/branches/amber-visualize","revision":2802}]}
10	10	1	2014-12-23 18:19:07.59	108456	CSM	SUCCESS	{"items":[],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/bi-report/branches/test-branch","revision":2898}]}
11	11	22	2014-11-11 16:30:52	547139	ktsaregradskyi	SUCCESS	{"items":[],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/jrs-ui/branches/bugfix-5.6.1","revision":8019}]}
12	12	142	2014-11-08 23:54:32	836183	ktsaregradskyi	SUCCESS	{"items":[],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/jrs-ui-pro/branches/amber-pro-dashboard","revision":6890}]}
13	13	30	2014-12-01 18:28:00	27913	dgorbenko	FAILURE	{"items":[],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/jrs-ui-pro/branches/amber-visualize","revision":6849}]}
14	14	41	2014-11-12 13:24:00	1052473	sprilukin	SUCCESS	{"items":[],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/jrs-ui-pro/branches/bugfix-5.6.1","revision":6903}]}
15	15	141	2014-12-18 10:49:47.463	988873	inesterenko	SUCCESS	{"items":[{"affectedPaths":["CHANGELOG.md","package.json"],"author":{"absoluteUrl":"http://build-master-fafj.jaspersoft.com/user/inesterenko","fullName":"Igor Nesterenko"},"commitId":"6993","timestamp":1418892549315,"date":"2014-12-18T08:49:09.315252Z","msg":"updated changelog, prepared to create tag, switched proper version of other packages","paths":[{"editType":"edit","file":"/trunk/CHANGELOG.md"},{"editType":"edit","file":"/trunk/package.json"}],"revision":6993,"user":"Igor Nesterenko"}],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/jrs-ui-pro/trunk","revision":6993}]}
16	16	3	2014-12-24 15:35:32.502	967591	ktsaregradskyi	SUCCESS	{"items":[],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/jrs-ui-pro/branches/amber-2-dashboard","revision":6999}]}
17	17	3	2014-12-17 16:07:09.852	955850	CSM	SUCCESS	{"items":[{"affectedPaths":["bower.json"],"author":{"absoluteUrl":"http://build-master-fafj.jaspersoft.com/user/inesterenko","fullName":"Igor Nesterenko"},"commitId":"6991","timestamp":1418825038446,"date":"2014-12-17T14:03:58.446158Z","msg":"-added resolution for js-sdk","paths":[{"editType":"edit","file":"/branches/amber-2-jive-refactoring/bower.json"}],"revision":6991,"user":"Igor Nesterenko"}],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/jrs-ui-pro/branches/amber-2-jive-refactoring","revision":6991}]}
18	18	16	2014-11-06 11:54:14	785432	nmarcu	SUCCESS	{"items":[],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/jrs-ui-pro/branches/amber-book","revision":6881}]}
19	19	32	2014-12-09 01:30:13	1373012	dlitvak	SUCCESS	{"items":[],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/jrs-ui-pro/branches/amber-pro-security-js","revision":6969}]}
20	20	2	2014-12-23 11:50:05.892	999592	CSM	SUCCESS	{"items":[{"affectedPaths":["karma.conf.js","package.json","tasks/options/jshint-source.js"],"author":{"absoluteUrl":"http://build-master-fafj.jaspersoft.com/user/psavushchik","fullName":"Pavel Savushchik"},"commitId":"6997","timestamp":1419328085479,"date":"2014-12-23T09:48:05.479988Z","msg":"karma-debug task was added.","paths":[{"editType":"edit","file":"/branches/amber2-tests-jsdoc-metrix/karma.conf.js"},{"editType":"edit","file":"/branches/amber2-tests-jsdoc-metrix/package.json"},{"editType":"edit","file":"/branches/amber2-tests-jsdoc-metrix/tasks/options/jshint-source.js"}],"revision":6997,"user":"Pavel Savushchik"}],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/jrs-ui-pro/branches/amber2-tests-jsdoc-metrix","revision":6997}]}
21	21	7	2014-12-15 13:32:06.07	934755	CSM	SUCCESS	{"items":[{"affectedPaths":["src/controls.options.js"],"author":{"absoluteUrl":"http://build-master-fafj.jaspersoft.com/user/sergey.prilukin","fullName":"sergey.prilukin"},"commitId":"6982","timestamp":1418643051137,"date":"2014-12-15T11:30:51.137181Z","msg":"JRS-3866: Bug 36049 - [Case #44748] Hidden (non-visible) input control values lost when IC reset button clicked","paths":[{"editType":"edit","file":"/branches/bugfix-6.0/src/controls.options.js"}],"revision":6982,"user":"sergey.prilukin"}],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/jrs-ui-pro/branches/bugfix-6.0","revision":6982}]}
22	22	6	2014-12-17 13:58:49.077	1040351	inesterenko	SUCCESS	{"items":[{"affectedPaths":["bower.json"],"author":{"absoluteUrl":"http://build-master-fafj.jaspersoft.com/user/inesterenko","fullName":"Igor Nesterenko"},"commitId":"6989","timestamp":1418817523693,"date":"2014-12-17T11:58:43.693725Z","msg":"-added missed resolutions for jrs-ui-pro","paths":[{"editType":"edit","file":"/branches/NavAcc508C/bower.json"}],"revision":6989,"user":"Igor Nesterenko"}],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/jrs-ui-pro/branches/NavAcc508C","revision":6989}]}
23	23	1	2014-12-23 19:39:07.965	1196670	CSM	SUCCESS	{"items":[],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/jrs-ui-pro/branches/test-branch","revision":6998}]}
24	24	110	2014-12-18 09:11:05.234	539578	inesterenko	SUCCESS	{"items":[{"affectedPaths":["package.json"],"author":{"absoluteUrl":"http://build-master-fafj.jaspersoft.com/user/inesterenko","fullName":"Igor Nesterenko"},"commitId":"8089","timestamp":1418886626157,"date":"2014-12-18T07:10:26.157163Z","msg":"-removed SNAPSHOT from overlay version","paths":[{"editType":"edit","file":"/trunk/package.json"}],"revision":8089,"user":"Igor Nesterenko"}],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/jrs-ui/trunk","revision":8089}]}
25	25	1	2014-12-23 19:00:12.936	752736	inesterenko	SUCCESS	{"items":[],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/jrs-ui/branches/amber-2-dashboard","revision":8042}]}
26	26	2	2014-12-17 15:20:09.646	542908	CSM	SUCCESS	{"items":[{"affectedPaths":["bower.json","package.json"],"author":{"absoluteUrl":"http://build-master-fafj.jaspersoft.com/user/inesterenko","fullName":"Igor Nesterenko"},"commitId":"8087","timestamp":1418822106752,"date":"2014-12-17T13:15:06.752243Z","msg":"-wired project through bower configs\\n-set proper names for overlays","paths":[{"editType":"edit","file":"/branches/amber-2-jive-refactoring/bower.json"},{"editType":"edit","file":"/branches/amber-2-jive-refactoring/package.json"}],"revision":8087,"user":"Igor Nesterenko"}],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/jrs-ui/branches/amber-2-jive-refactoring","revision":8087}]}
27	27	18	2014-11-06 11:41:05	545543	CSM	SUCCESS	{"items":[{"affectedPaths":["src/reportViewer/viewer.js"],"author":{"absoluteUrl":"http://build-master-fafj.jaspersoft.com/user/nmarcu","fullName":"Narcis Marcu"},"commitId":"7996","timestamp":1415266569913,"date":"2014-11-06T09:36:09.913532Z","msg":"proper parts cleanup","paths":[{"editType":"edit","file":"/branches/amber-book/src/reportViewer/viewer.js"}],"revision":7996,"user":"Narcis Marcu"}],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/jrs-ui/branches/amber-book","revision":7996}]}
28	28	39	2014-12-07 11:14:10	526033	CSM	SUCCESS	{"items":[{"affectedPaths":["src/repository.search.components.js"],"author":{"absoluteUrl":"http://build-master-fafj.jaspersoft.com/user/dlitvak","fullName":"Dmitriy Litvak"},"commitId":"8071","timestamp":1417943488736,"date":"2014-12-07T09:11:28.736076Z","msg":"Bug 40407 - Security: artifacts appears in report name when user open report Properties if we have name with ()= symbols","paths":[{"editType":"edit","file":"/branches/amber-ce-security-js/src/repository.search.components.js"}],"revision":8071,"user":"Dmitriy Litvak"}],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/jrs-ui/branches/amber-ce-security-js","revision":8071}]}
29	29	16	2014-10-28 22:15:37	31985	CSM	FAILURE	{"items":[{"affectedPaths":["","Gruntfile.js"],"author":{"absoluteUrl":"http://build-master-fafj.jaspersoft.com/user/inesterenko","fullName":"Igor Nesterenko"},"commitId":"7969","timestamp":1414527083839,"date":"2014-10-28T20:11:23.839163Z","msg":"downmerged from trunk","paths":[{"editType":"edit","file":"/branches/amber-visualize"},{"editType":"edit","file":"/branches/amber-visualize/Gruntfile.js"}],"revision":7969,"user":"Igor Nesterenko"}],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/jrs-ui/branches/amber-visualize","revision":7969}]}
30	30	3	2014-12-23 11:34:05.828	543074	CSM	SUCCESS	{"items":[{"affectedPaths":["package.json","tasks/options/jshint-source.js","test/test/mng.main.tests.js"],"author":{"absoluteUrl":"http://build-master-fafj.jaspersoft.com/user/psavushchik","fullName":"Pavel Savushchik"},"commitId":"8094","timestamp":1419327100617,"date":"2014-12-23T09:31:40.617374Z","msg":"karma-debug task was added.\\ndisabled tests for mng.main","paths":[{"editType":"edit","file":"/branches/amber2-tests-jsdoc-metrix/package.json"},{"editType":"edit","file":"/branches/amber2-tests-jsdoc-metrix/tasks/options/jshint-source.js"},{"editType":"edit","file":"/branches/amber2-tests-jsdoc-metrix/test/test/mng.main.tests.js"}],"revision":8094,"user":"Pavel Savushchik"}],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/jrs-ui/branches/amber2-tests-jsdoc-metrix","revision":8094}]}
31	31	7	2014-12-15 13:34:06.08	506334	CSM	SUCCESS	{"items":[{"affectedPaths":["src/controls.controller.js","src/controls.datatransfer.js","src/controls.report.js","test/test/controls.controller.tests.js"],"author":{"absoluteUrl":"http://build-master-fafj.jaspersoft.com/user/sergey.prilukin","fullName":"sergey.prilukin"},"commitId":"8081","timestamp":1418643058656,"date":"2014-12-15T11:30:58.656941Z","msg":"JRS-3866: Bug 36049 - [Case #44748] Hidden (non-visible) input control values lost when IC reset button clicked","paths":[{"editType":"edit","file":"/branches/bugfix-6.0/src/controls.controller.js"},{"editType":"edit","file":"/branches/bugfix-6.0/src/controls.datatransfer.js"},{"editType":"edit","file":"/branches/bugfix-6.0/src/controls.report.js"},{"editType":"edit","file":"/branches/bugfix-6.0/test/test/controls.controller.tests.js"}],"revision":8081,"user":"sergey.prilukin"}],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/jrs-ui/branches/bugfix-6.0","revision":8081}]}
32	32	4	2014-12-16 18:31:39.458	701842	inesterenko	SUCCESS	{"items":[{"affectedPaths":["bower.json"],"author":{"absoluteUrl":"http://build-master-fafj.jaspersoft.com/user/inesterenko","fullName":"Igor Nesterenko"},"commitId":"8085","timestamp":1418747470931,"date":"2014-12-16T16:31:10.931792Z","msg":"-fixed build, added proper resolution","paths":[{"editType":"edit","file":"/branches/NavAcc508C/bower.json"}],"revision":8085,"user":"Igor Nesterenko"}],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/jrs-ui/branches/NavAcc508C","revision":8085}]}
33	33	79	2014-12-18 08:34:09.232	51162	CSM	SUCCESS	{"items":[{"affectedPaths":["CHANGELOG.md"],"author":{"absoluteUrl":"http://build-master-fafj.jaspersoft.com/user/inesterenko","fullName":"Igor Nesterenko"},"commitId":"733","timestamp":1418884198153,"date":"2014-12-18T06:29:58.153312Z","msg":"updated changelog, prepared to create tag","paths":[{"editType":"edit","file":"/trunk/CHANGELOG.md"}],"revision":733,"user":"Igor Nesterenko"}],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/js-sdk/trunk","revision":733}]}
34	34	3	2014-12-18 12:17:10.201	61674	CSM	SUCCESS	{"items":[{"affectedPaths":["Gruntfile.js","package.json"],"author":{"absoluteUrl":"http://build-master-fafj.jaspersoft.com/user/psavushchik","fullName":"Pavel Savushchik"},"commitId":"736","timestamp":1418897616815,"date":"2014-12-18T10:13:36.815460Z","msg":"grunt connect extension added.","paths":[{"editType":"edit","file":"/branches/amber-2-jive-refactoring/Gruntfile.js"},{"editType":"edit","file":"/branches/amber-2-jive-refactoring/package.json"}],"revision":736,"user":"Pavel Savushchik"}],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/js-sdk/branches/amber-2-jive-refactoring","revision":736}]}
35	35	24	2014-10-28 12:25:40	47973	CSM	SUCCESS	{"items":[{"affectedPaths":["src/common/component/multiSelect/view/AvailableItemsList.js"],"author":{"absoluteUrl":"http://build-master-fafj.jaspersoft.com/user/dgorbenko","fullName":"Dmytro Gorbenko"},"commitId":"344","timestamp":1414491816060,"date":"2014-10-28T10:23:36.060437Z","msg":"fixing issue with undefined variable jQuery","paths":[{"editType":"edit","file":"/branches/amber-visualize/src/common/component/multiSelect/view/AvailableItemsList.js"}],"revision":344,"user":"Dmytro Gorbenko"}],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/js-sdk/branches/amber-visualize","revision":344}]}
36	36	37	2014-12-23 19:03:21.509	105148	inesterenko	SUCCESS	{"items":[],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/js-sdk/branches/amber2-tests-jsdoc-metrix","revision":738}]}
37	37	23	2014-11-08 23:51:06	536181	CSM	SUCCESS	{"items":[{"affectedPaths":["src/reportViewer/viewer.js"],"author":{"absoluteUrl":"http://build-master-fafj.jaspersoft.com/user/ktsaregradskyi","fullName":"Kostiantyn Tsaregradskyi"},"commitId":"8010","timestamp":1415483320344,"date":"2014-11-08T21:48:40.344038Z","msg":"Additional checks for console.log to prevent errors in IE8","paths":[{"editType":"edit","file":"/branches/amber-ce-dashboard/src/reportViewer/viewer.js"}],"revision":8010,"user":"Kostiantyn Tsaregradskyi"},{"affectedPaths":["src/reportViewer/viewer.js"],"author":{"absoluteUrl":"http://build-master-fafj.jaspersoft.com/user/ktsaregradskyi","fullName":"Kostiantyn Tsaregradskyi"},"commitId":"8009","timestamp":1415483211180,"date":"2014-11-08T21:46:51.180809Z","msg":"Revert: Use our logger instead of console","paths":[{"editType":"edit","file":"/branches/amber-ce-dashboard/src/reportViewer/viewer.js"}],"revision":8009,"user":"Kostiantyn Tsaregradskyi"}],"kind":"svn","revisions":[{"module":"svn+ssh://falcon.jaspersoft.com/jrs-ui/branches/amber-ce-dashboard","revision":8010}]}
\.


--
-- Name: faf_metrics_build_build_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('faf_metrics_build_build_id_seq', 37, true);


--
-- Data for Name: faf_metrics_build_time; Type: TABLE DATA; Schema: public; Owner: -
--

COPY faf_metrics_build_time (id, build_id, task_name, task_time) FROM stdin;
1	30	loading tasks	6
2	30	merge-requirejs-configs	16
3	30	karma:phantom	12826
4	30	clean:optimization	6
5	30	clean:filteredSources	32
6	30	generate-additional-filteredSources-config	7
7	30	copy:filteredSources	1700
8	30	generate-requirejs-optimize-options	4
9	30	requirejs:optimize	446535
10	30	clean:overlay	12
11	30	clean:maven	6
12	30	copy:overlay	1486
13	30	compress:overlay	5773
14	30	karma:coverage	13950
15	30	jsdoc:dist	15620
16	36	loading tasks	9
17	36	merge-requirejs-configs	11
18	36	karma:phantom	22603
19	36	jshint:source	5886
20	36	jshint:test	3748
21	36	karma:coverage	21399
22	36	jsdoc:dist	9734
\.


--
-- Name: faf_metrics_build_time_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('faf_metrics_build_time_id_seq', 22, true);


--
-- Data for Name: faf_metrics_jenkins_jobs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY faf_metrics_jenkins_jobs (job_id, job_name, module, feature) FROM stdin;
1	module-bi-control-trunk	bi-control	trunk
2	env-backup-jenkins	env-backup-jenkins	env-backup-jenkins
3	module-bi-control-trunk-amber-visualize	bi-control	amber-visualize
4	module-bi-control-trunk-amber-2-jive-refactoring	bi-control	amber-2-jive-refactoring
5	module-bi-dashboard-trunk	bi-dashboard	trunk
6	module-bi-dashboard-trunk-amber-2-jive-refactoring	bi-dashboard	amber-2-jive-refactoring
7	module-bi-report-trunk	bi-report	trunk
8	module-bi-report-trunk-amber-2-jive-refactoring	bi-report	amber-2-jive-refactoring
9	module-bi-report-trunk-amber-visualize	bi-report	amber-visualize
10	module-bi-report-trunk-test-branch	bi-report	test-branch
15	module-jrs-ui-pro-trunk	jrs-ui-pro	trunk
16	module-jrs-ui-pro-trunk-amber-2-dashboard	jrs-ui-pro	amber-2-dashboard
17	module-jrs-ui-pro-trunk-amber-2-jive-refactoring	jrs-ui-pro	amber-2-jive-refactoring
18	module-jrs-ui-pro-trunk-amber-book	jrs-ui-pro	amber-book
19	module-jrs-ui-pro-trunk-amber-pro-security-js	jrs-ui-pro	amber-pro-security-js
20	module-jrs-ui-pro-trunk-amber2-tests-jsdoc-metrix	jrs-ui-pro	amber2-tests-jsdoc-metrix
21	module-jrs-ui-pro-trunk-bugfix-6.0	jrs-ui-pro	bugfix-6.0
22	module-jrs-ui-pro-trunk-NavAcc508C	jrs-ui-pro	NavAcc508C
23	module-jrs-ui-pro-trunk-test-branch	jrs-ui-pro	test-branch
24	module-jrs-ui-trunk	jrs-ui	trunk
25	module-jrs-ui-trunk-amber-2-dashboard	jrs-ui	amber-2-dashboard
26	module-jrs-ui-trunk-amber-2-jive-refactoring	jrs-ui	amber-2-jive-refactoring
27	module-jrs-ui-trunk-amber-book	jrs-ui	amber-book
28	module-jrs-ui-trunk-amber-ce-security-js	jrs-ui	amber-ce-security-js
29	module-jrs-ui-trunk-amber-visualize	jrs-ui	amber-visualize
30	module-jrs-ui-trunk-amber2-tests-jsdoc-metrix	jrs-ui	amber2-tests-jsdoc-metrix
31	module-jrs-ui-trunk-bugfix-6.0	jrs-ui	bugfix-6.0
32	module-jrs-ui-trunk-NavAcc508C	jrs-ui	NavAcc508C
33	module-js-sdk-trunk	js-sdk	trunk
34	module-js-sdk-trunk-amber-2-jive-refactoring	js-sdk	amber-2-jive-refactoring
35	module-js-sdk-trunk-amber-visualize	js-sdk	amber-visualize
36	module-js-sdk-trunk-amber2-tests-jsdoc-metrix	js-sdk	amber2-tests-jsdoc-metrix
11	module-jrs-ui-bugfix-5.6.1	jrs-ui	bugfix-5.6.1
12	module-jrs-ui-pro-amber-pro-dashboard	jrs-ui-pro	amber-pro-dashboard
13	module-jrs-ui-pro-amber-pro-visualize	jrs-ui-pro	amber-pro-visualize
14	module-jrs-ui-pro-bugfix-5.6.1	jrs-ui-pro	bugfix-5.6.1
37	module-js-ui-amber-ce-dashboard	jrs-ui	amber-ce-dashboard
\.


--
-- Name: faf_metrics_jenkins_jobs_job_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('faf_metrics_jenkins_jobs_job_id_seq', 37, true);


--
-- Name: faf_metrics_build_job_id_build_key; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY faf_metrics_build
    ADD CONSTRAINT faf_metrics_build_job_id_build_key UNIQUE (job_id, build);


--
-- Name: faf_metrics_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY faf_metrics_build
    ADD CONSTRAINT faf_metrics_build_pkey PRIMARY KEY (build_id);


--
-- Name: faf_metrics_build_time_build_id_task_name_key; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY faf_metrics_build_time
    ADD CONSTRAINT faf_metrics_build_time_build_id_task_name_key UNIQUE (build_id, task_name);


--
-- Name: faf_metrics_build_time_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY faf_metrics_build_time
    ADD CONSTRAINT faf_metrics_build_time_pkey PRIMARY KEY (id);


--
-- Name: faf_metrics_jenkins_jobs_job_name_key; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY faf_metrics_jenkins_jobs
    ADD CONSTRAINT faf_metrics_jenkins_jobs_job_name_key UNIQUE (job_name);


--
-- Name: faf_metrics_jenkins_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY faf_metrics_jenkins_jobs
    ADD CONSTRAINT faf_metrics_jenkins_jobs_pkey PRIMARY KEY (job_id);


--
-- Name: faf_metrics_build_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY faf_metrics_build
    ADD CONSTRAINT faf_metrics_build_job_id_fkey FOREIGN KEY (job_id) REFERENCES faf_metrics_jenkins_jobs(job_id);


--
-- Name: faf_metrics_build_time_build_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY faf_metrics_build_time
    ADD CONSTRAINT faf_metrics_build_time_build_id_fkey FOREIGN KEY (build_id) REFERENCES faf_metrics_build(build_id);


--
-- Name: public; Type: ACL; Schema: -; Owner: -
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

