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
    job_id integer NOT NULL,
    build integer NOT NULL,
    started timestamp without time zone NOT NULL,
    duration integer,
    started_by text,
    result text,
    change_set text
);


--
-- Name: faf_metrics_build_time; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE faf_metrics_build_time (
    job_id integer NOT NULL,
    build integer NOT NULL,
    task_name text NOT NULL,
    task_time integer NOT NULL
);


--
-- Name: faf_metrics_jenkins_jobs; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE faf_metrics_jenkins_jobs (
    job_id integer NOT NULL,
    job_name text NOT NULL
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
-- Name: job_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY faf_metrics_jenkins_jobs ALTER COLUMN job_id SET DEFAULT nextval('faf_metrics_jenkins_jobs_job_id_seq'::regclass);


--
-- Data for Name: faf_metrics_build; Type: TABLE DATA; Schema: public; Owner: -
--

COPY faf_metrics_build (job_id, build, started, duration, started_by, result, change_set) FROM stdin;
\.


--
-- Data for Name: faf_metrics_build_time; Type: TABLE DATA; Schema: public; Owner: -
--

COPY faf_metrics_build_time (job_id, build, task_name, task_time) FROM stdin;
\.


--
-- Data for Name: faf_metrics_jenkins_jobs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY faf_metrics_jenkins_jobs (job_id, job_name) FROM stdin;
\.


--
-- Name: faf_metrics_jenkins_jobs_job_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('faf_metrics_jenkins_jobs_job_id_seq', 2092, true);


--
-- Name: faf_metrics_build_PKey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY faf_metrics_build
    ADD CONSTRAINT "faf_metrics_build_PKey" PRIMARY KEY (job_id, build);


--
-- Name: faf_metrics_build_time_PKey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY faf_metrics_build_time
    ADD CONSTRAINT "faf_metrics_build_time_PKey" PRIMARY KEY (job_id, build, task_name);


--
-- Name: faf_metrics_jenkins_jobs_PKey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY faf_metrics_jenkins_jobs
    ADD CONSTRAINT "faf_metrics_jenkins_jobs_PKey" PRIMARY KEY (job_id);


--
-- Name: faf_metrics_jenkins_jobs_job_name_key; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY faf_metrics_jenkins_jobs
    ADD CONSTRAINT faf_metrics_jenkins_jobs_job_name_key UNIQUE (job_name);


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

