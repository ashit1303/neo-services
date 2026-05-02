# IMPORTING PACKAGES
from airflow import DAG
from datetime import datetime, timedelta
from airflow.operators.bash import BashOperator

# GETTING USERNAME DYNAMICALLY
import getpass
user = getpass.getuser()

# SETTING EMAIL CONFIGURATIONS AND DEFAULT ARGUMENTS
default_args = {
    'owner': 'ashit',  # Set owner dynamically
    'email': ['ashit@myfortlio.com'],
    'email_on_failure': True,
    'email_on_retry': True,
    'email_on_success': False,
    'start_date': datetime(2025, 5, 1),
    'depends_on_past': False,
    'retries': 0,
    'include_logs': True
}

# INITIALIZING THE DAG
dag = DAG(dag_id='daily-midnight-crons', default_args=default_args, catchup=False,
          schedule_interval='0 0 * * *', tags=['nodejs', 'ashit', 'runner-daily-midnight', 'updates', 'analytics'])  # Set a tag dynamically


start_data_sync_to_ch = BashOperator(
    task_id="run-data-sync-to-clickhouse",
    bash_command=(
    'bash -c "cd /home/{{ params.user }}/neo-services/airflow-scripts && BUN_ENV=prod bun run /home/{{ params.user }}/neo-services/airflow-scripts/scripts/data-sync-to-clickhouse-daily.ts "'
    ),
    params={'user': user},
    dag=dag,
)

start_export_parquet_from_ch_to_s3 = BashOperator(
    task_id="run-export-parquet-from-clickhouse-to-s3",
    bash_command=(
    'bash -c "cd /home/{{ params.user }}/neo-services/airflow-scripts && BUN_ENV=prod bun run /home/{{ params.user }}/neo-services/airflow-scripts/scripts/export-parquet-from-clickhouse-to-s3-daily.ts "'
    ),
    params={'user': user},
    dag=dag,
)


# start_sync_forti_knowledge_base = BashOperator(
#     task_id="run-sync-forti-knowledge-base",
#     bash_command=(
#     'bash -c "cd /home/{{ params.user }}/neo-services/airflow-scripts && BUN_ENV=prod bun run /home/{{ params.user }}/neo-services/airflow-scripts/scripts/sync-forti-llm.ts "'
#     ),
#     params={'user': user},
#     dag=dag,
# )

start_data_sync_to_ch_dev = BashOperator(
    task_id="run-data-sync-to-clickhouse_dev",
    bash_command=(
    'bash -c "cd /home/{{ params.user }}/neo-services/airflow-scripts && BUN_ENV=dev bun run /home/{{ params.user }}/neo-services/airflow-scripts/scripts/data-sync-to-clickhouse-daily.ts "'
    ),
    params={'user': user},
    dag=dag,
)

start_trips_stats >> start_battery_stats  >> start_data_sync_to_ch >> start_export_parquet_from_ch_to_s3 >> start_data_odo_update_to_zoho >>  start_trips_stats_dev >> start_battery_stats_dev >> start_data_sync_to_ch_dev
