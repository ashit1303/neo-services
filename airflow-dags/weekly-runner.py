# IMPORTING PACKAGES
from airflow import DAG
from datetime import datetime, timedelta
from airflow.operators.bash import BashOperator
from airflow.utils.email import send_email
import os
import re

# GETTING USERNAME DYNAMICALLY
import getpass
user = getpass.getuser()

# SETTING EMAIL CONFIGURATIONS AND DEFAULT ARGUMENTS
default_args = {
    'owner': 'ashit',  # Set owner dynamically
    'email': ['ashit@fortlio.com'],
    'email_on_failure': True,
    'email_on_retry': False,
    'email_on_success': False,
    'start_date': datetime(2025, 9, 24),
    'depends_on_past': False,
    'retries': 0,
    'include_logs': True
}

# INITIALIZING THE DAG
dag = DAG(dag_id='weekly-reports-notification', default_args=default_args, catchup=False,
          schedule_interval='5 0 */7 * *', tags=['nodejs', 'ashit', 'weekly-reports-notification', 'updates', 'weekly-reports'])  # Set a tag dynamically

weekly_reports_notification_prod = BashOperator(
    task_id="run-weekly-reports-notification-prod",
    bash_command=(
    'bash -c "cd /home/{{ params.user }}/neo-services/airflow-scripts && BUN_ENV=prod bun run /home/{{ params.user }}/neo-services/airflow-scripts/scripts/weekly-reports-notification.ts "'
    ),
    params={'user': user}, 

    dag=dag,
)


weekly_reports_notification_prod