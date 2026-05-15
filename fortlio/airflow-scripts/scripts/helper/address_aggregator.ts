export const getAddressDetailsSQL = `

SELECT
    h3_10,
    avgMerge(lat_state) AS latitude,
    avgMerge(lon_state) AS longitude,
    sumMerge(charge_count_state) AS total_charges,
    sumMerge(trip_start_count_state) AS total_trip_starts,
    sumMerge(trip_end_count_state) AS total_trip_ends,
    minMerge(first_seen) AS first_seen_at,
    maxMerge(last_seen) AS last_seen_at
FROM address_h3_10_agg
GROUP BY h3_10
ORDER BY h3_10;
`;