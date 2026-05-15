#!/bin/bash

# ====== CONFIGURATION ======
PGHOST="localhost"
PGPORT="8812"
PGUSER="admin"
PGPASSWORD="quest"
PGDATABASE="qdb"

user=$(whoami)
OUTPUT_DIR="/home/$user/.questdb/export"
    S3_BUCKET="s3://fortlio-questdb-prod/logs-parquet"
    WAIT_TIME=300   # 5 minutes

# ====== DATE RANGE ======
START_DATE="2025-09-01"
END_DATE="2025-12-01"

# mkdir -p "$OUTPUT_DIR"
# export PGPASSWORD

current_date="$START_DATE"

while [[ "$current_date" < "$END_DATE" || "$current_date" == "$END_DATE" ]]; do
    
    LOOP_DATE=$(date -d "$current_date" +"%Y-%m-%d")

    # Filename uses the SAME date we are processing
    FILENAME="logs-${LOOP_DATE}.parquet"
    FILEPATH="${OUTPUT_DIR}/${FILENAME}"

    echo "=== Exporting data for: $LOOP_DATE ==="
    echo "Output file: $FILENAME"

    # --- Run COPY command ---
    PGPASSWORD="quest" psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -c \
    "COPY (
        SELECT * 
        FROM logs 
        WHERE packetCreatedAt in '${LOOP_DATE}'
    ) TO '${FILENAME}' WITH FORMAT PARQUET COMPRESSION_CODEC ZSTD COMPRESSION_LEVEL 6 ;"

    echo "Waiting 5 minutes..."
    sleep $WAIT_TIME

    # --- Upload to S3 ---
    echo "Uploading ${FILEPATH} to ${S3_BUCKET}/"
    aws s3 cp "${FILEPATH}" "${S3_BUCKET}/"

    # --- Delete local file ---
    echo "Deleting ${FILEPATH}"
    rm -f "${FILEPATH}"

    # Move to next day
    current_date=$(date -I -d "$current_date + 1 day")
done

echo "=== Completed exports from $START_DATE to $END_DATE ==="
