CREATE TABLE faf_metrics_build_size (
    id SERIAL primary key,
    build_id integer NOT NULL references faf_metrics_build(build_id),
    file_name text NOT NULL,
    file_size integer NOT NULL,
    UNIQUE (build_id, file_name)
);

