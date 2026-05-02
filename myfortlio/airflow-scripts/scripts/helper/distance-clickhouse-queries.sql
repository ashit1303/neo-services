-- pincode dimension table
CREATE TABLE pincode_dim
(
    pincode UInt32,
    division String,
    region   String,
    office    String,
    district String,
    state    String,
    city     String,
    zone String,
    tier UInt8,
    latitude Float32,
    longitude Float32
)
ENGINE = MergeTree
PRIMARY KEY pincode
ORDER BY pincode;

-- pincode to h3_8 mapping
CREATE TABLE pincode_h3_map
(
    pincode String,
    h3_8 UInt64
)
ENGINE = MergeTree
ORDER BY (pincode, h3_8);

CREATE TABLE pincode_h3_compact
(
    pincode UInt32,
    h3_index UInt64
)
ENGINE = MergeTree
ORDER BY (pincode, h3_index);

ALTER TABLE pincode_h3_compact
ADD INDEX idx_h3 h3_index TYPE minmax GRANULARITY 4;


-- table to store unique addresses within 50 meters 
CREATE TABLE address_h3_10_agg
(
    h3_10 UInt64,

    -- aggregate states (not raw values)
    lat_state AggregateFunction(avg, Float32),
    lon_state AggregateFunction(avg, Float32),

    -- hit_count AggregateFunction(count),

    charge_count_state     AggregateFunction(sum, UInt64),
    start_count_state AggregateFunction(sum, UInt64),
    end_count_state   AggregateFunction(sum, UInt64),

    first_seen AggregateFunction(min, DateTime),
    last_seen  AggregateFunction(max, DateTime)
)
ENGINE = AggregatingMergeTree
ORDER BY h3_10;


INSERT INTO address_h3_10_agg
SELECT
    geoToH3(lon, lat, 10) AS h3_10,
    avgState(lat)        AS lat_state,
    avgState(lon)        AS lon_state,

    -- hit_count AggregateFunction(count),

    sumState(1) AS charge_count_state,
    sumState(0) AS trip_start_count_state,
    sumState(0) AS trip_end_count_state,
    minState(event_time) AS first_seen,
    maxState(event_time) AS last_seen
FROM charging_events
GROUP BY h3_10;

approximate all hex in a particular state
approximate all hex in a particular pincode


SELECT
    count(*) AS charge_events
FROM vehicle_charging_logs cd
INNER JOIN
(
    SELECT DISTINCT pm.h3_8
    FROM pincode_dim pd
    INNER JOIN pincode_h3_map pm
        ON pm.pincode = pd.pincode
    WHERE pd.state = 'DELHI'
) AS state_hexes
ON h3ToParent(cd.h3_10, 9) = state_hexes.h3_9
WHERE cd.event_time >= now() - INTERVAL 30 DAY;
;

SELECT
    e.event_id,
    m.pincode
FROM charging_events e
LEFT JOIN pincode_h3_map m
    ON m.h3_9 = h3ToParent(e.h3_10, 9);


--- optional dictionary in case of multiple lookups in more often
CREATE DICTIONARY pincode_by_h3_9
(
    h3_9 UInt64,
    pincode String
)
PRIMARY KEY h3_9
SOURCE(CLICKHOUSE(
    TABLE 'pincode_h3_map'
))
LAYOUT(HASHED());
