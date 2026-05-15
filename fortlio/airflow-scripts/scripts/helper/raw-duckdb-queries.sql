-- duckdb

CREATE SECRET s3_secret (
  TYPE s3,
  KEY_ID 'aws-key',
  SECRET 'aws-secret',
  REGION 'ap-south-1'
);
select distinct column_type from (DESCRIBE SELECT * FROM read_parquet('s3://fortlio/logs-parquet-dump/logs-2025-10-31.parquet'));

select count() from read_parquet('s3://bucket/path/to/*.parquet');

SELECT count() FROM read_parquet('s3://fortlio/logs-parquet/*.parquet') where m = 'xxx' ;

create table pincode_all_tagged
SELECT
  COALESCE(pm.pincode, rd.pincode) AS pincode,  
  -- Prefer pm values, fallback to rd
  COALESCE(pm.office, rd.taluk)      AS office,
  COALESCE(pm.division, rd.division) AS division,
  COALESCE(pm.region, rd.region)     AS region,
  COALESCE(pm.state, rd.circle)      AS state,  
  -- Fields only available in regions_data
  rd.city,
  rd.zone,
  rd.tier,
  rd.latitude,
  rd.longitude  
  -- Source indicator
  CASE
      WHEN pm.pincode IS NOT NULL AND rd.pincode IS NOT NULL THEN 'BOTH'
      WHEN pm.pincode IS NOT NULL THEN 'PINCODE_METADATA'
      WHEN rd.pincode IS NOT NULL THEN 'REGIONS_DATA'
  END AS source
FROM pincode_metadata pm
FULL OUTER JOIN regions_data rd
    ON pm.pincode = rd.pincode;

SELECT
  e.key AS pincode,
  e.value.Office_Name AS office_name,
  e.value.Division AS division,
  e.value.Region AS region,
  e.value.Circle AS circle
FROM read_json_auto('pincode_metadata.json'),
UNNEST(map_entries(json)) AS t(e);

COPY (
      SELECT
          e.key AS pincode,
          e.value.Office_Name AS office_name,
          e.value.Division AS division,
          e.value.Region AS region,
          e.value.Circle AS circle
      FROM read_json_auto('pincode_metadata.json'),
           UNNEST(map_entries(json)) AS t(e)
  )
  TO 'pincode_metadata.csv'
  (HEADER, SEP ',');

CREATE TABLE regions_data AS
  SELECT *, 'location.coordinates[0]' as longitude ,'location.coordinates[1]' as latitude FROM read_csv_auto('regions-csv-migrate.csv');

SELECT
      SUM(CASE WHEN UPPER(TRIM(rd.city)) = UPPER(TRIM(pm.division)) THEN 1 ELSE 0 END) AS exact_match_count,
      SUM(CASE WHEN pm.pincode IS NOT NULL AND UPPER(TRIM(rd.city)) <> UPPER(TRIM(pm.division)) THEN 1 ELSE 0 END) AS different_count
  FROM regions_data rd
  LEFT JOIN pincode_metadata pm
      ON rd.pincode = pm.pincode;

 create table pincode_all_tagged as
  SELECT
  COALESCE(pm.pincode, rd.pincode) AS pincode,
  -- Prefer pm values, fallback to rd
  COALESCE(pm.office, rd.taluk)      AS office,
  COALESCE(pm.division, rd.division) AS division,
  COALESCE(pm.region, rd.region)     AS region,
  COALESCE(pm.state, rd.circle)      AS state,
  -- Fields only available in regions_data
  rd.city,
  rd.zone,
  rd.tier,
  rd.latitude,
  rd.longitude,
  -- Source indicator
  CASE
      WHEN pm.pincode IS NOT NULL AND rd.pincode IS NOT NULL THEN 'BOTH'
      WHEN pm.pincode IS NOT NULL THEN 'PINCODE_METADATA'
      WHEN rd.pincode IS NOT NULL THEN 'REGIONS_DATA'
  END AS source
  FROM pincode_metadata pm
  FULL OUTER JOIN regions_data rd
      ON pm.pincode = rd.pincode;
copy pincode_all_tagged to 'pincode_all_tagged.csv';

---------------------------------------------- TRIPS MIGRATION USING DUCKDB ----------------------------------------------
mongoexport \
  --uri="mongodb+srv://fortlio-password@fortlio-db.xxxxxx.mongodb.net/fortlio-db" \
  --collection=log \
  --type=csv \
  --fields="" \
  --out=log.csv


CREATE TABLE logs AS
SELECT
  StartTime                             AS start_time,
  EndTime                               AS end_time,
  -- duration in minutes
  date_diff('minute', StartTime, EndTime) AS session_duration_minutes,
  -- coordinates (note: CSV was lon,lat)
  "startLocation.coordinates.1"             AS start_latitude,
  "startLocation.coordinates.0"             AS start_longitude
FROM read_csv_auto(
  'log.csv',
  header = true,
  timestampformat = '%Y-%m-%dT%H:%M:%S.%fZ'
);


COPY (
  SELECT *
  FROM logs
  ORDER BY h, created_at
)
TO 's3://fortlio/logs-parquet/logs-2026-01-28.parquet'
WITH (
  FORMAT PARQUET,
  COMPRESSION 'ZSTD',
  COMPRESSION_LEVEL 6,
  ROW_GROUP_SIZE 500000
);