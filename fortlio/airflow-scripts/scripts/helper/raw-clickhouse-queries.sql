CREATE TABLE logs
(
    `seq_id` Int64,
    INDEX idx_speed speed TYPE minmax GRANULARITY 1,
)
ENGINE = ReplacingMergeTree(packet_created_at)  -- enables dedup
PARTITION BY toYYYYMMDD(packet_created_at)
ORDER BY (imei, packet_created_at)
SETTINGS index_granularity = 2048;

INSERT INTO logs (seq_id)
SELECT seqId                    as seq_id,
FROM s3(
  'https://myfortlio.s3.ap-south-1.amazonaws.com/logs-parquet/logs-2025-08-*.parquet',
  'Parquet',
  extra_credentials(
    role_arn = 'arn:aws:iam::xxxxxx:role/clickhouse-s3-prod'
  )
);



----------------------------------------------------------------- EXPORT -----------------------------------------------------------------
INSERT INTO FUNCTION s3(
    'https://s3.amazonaws.com/my-bucket/path/file.csv',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'CSV'
)
SELECT *
FROM logs
WHERE createdAt > '2025-12-01';



SELECT COUNT(DISTINCT user_id) FROM logs


SELECT uniq(user_id) FROM logs

-- https://clickhouse.com/resources/engineering/clickhouse-query-optimisation-definitive-guide
-- https://clickhouse.com/docs/optimize/query-optimization
-- https://clickhouse.com/resources/engineering/clickhouse-query-optimisation-definitive-guide

