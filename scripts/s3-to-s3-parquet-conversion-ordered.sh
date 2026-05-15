user=$(whoami)
START_DATE="2025-11-17"
    END_DATE="2025-11-17"
current_date="$START_DATE"

while [[ "$current_date" < "$END_DATE" || "$current_date" == "$END_DATE" ]]; do
    LOOP_DATE=$(date -d "$current_date" +"%Y-%m-%d")
    echo "=== Exporting data for: $LOOP_DATE ==="
    IN_FILE="s3://fortlio-questdb-prod/logs-parquet/logs-${LOOP_DATE}.parquet"
    # IN_FILE="s3://fortlio-logs-prod/logs-parquet-dump/logs-${LOOP_DATE}.parquet"
    OUT_FILE="s3://fortlio-logs-prod/logs-parquet/logs-${LOOP_DATE}.parquet"
    # OUT_FILE="/home/${user}/parquet-tests/logs-${LOOP_DATE}.parquet"

    duckdb <<EOF
    SET s3_access_key_id='key';
    SET s3_secret_access_key='pass';
    SET s3_region='ap-south-1';
    COPY (
        SELECT *
               -- EXCLUDE(_id)
               REPLACE (0 AS cs24)
        FROM read_parquet('${IN_FILE}')
        ORDER BY packetCreatedAt
    )
    TO '${OUT_FILE}'
    WITH (
        FORMAT PARQUET,
        COMPRESSION 'ZSTD',
        COMPRESSION_LEVEL 6,
        ROW_GROUP_SIZE 500000
    );
EOF
    current_date=$(date -I -d "$current_date + 1 day")
done
echo "=== Completed exports from $START_DATE to $END_DATE ==="