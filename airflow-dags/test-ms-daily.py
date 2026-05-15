# IMPORTING PACKAGES
from airflow import DAG
from datetime import datetime, timedelta
from airflow.operators.bash import BashOperator
from airflow.utils.task_group import TaskGroup
from airflow.utils.trigger_rule import TriggerRule
from airflow.models import Variable
import os

# Get username from environment or default
user = os.getenv('USER', 'ashit')

# SETTING EMAIL CONFIGURATIONS AND DEFAULT ARGUMENTS
default_args = {
    'owner': 'ashit',
    'email': ['myfortlio@obenelectric.com'],
    'email_on_failure': True,
    'email_on_retry': True,
    'email_on_success': True,
    'start_date': datetime(2025, 5, 1),
    'depends_on_past': False,
    'retries': 0,
    'include_logs': True
}

# INITIALIZING THE DAG
dag = DAG(
    'test-microservices-daily',
    default_args=default_args,
    description='Run tests for all microservices daily',
    schedule_interval='0 0 * * *',  # Run at midnight daily
    start_date=datetime(2025, 6, 1),
    tags=['testing', 'microservices'],
)

# Initial git pull task with husky handling
git_pull = BashOperator(
    task_id='git_pull',
    bash_command=f'''
        set -e
        cd /home/{user}/neo-services/

        # First git pull to get latest changes
        git pull
        
        # Store git pull output to check for changes
        PULL_OUTPUT=$(git pull)
        
        # Check if there were any changes
        if echo "$PULL_OUTPUT" | grep -v 'Already up to date.' > /dev/null; then
            echo "Changes found. Sleeping for 5 minutes before continuing"
            sleep 300
        else
            echo "No changes found. Continuing..."
        fi

        echo "Git operations completed"
    ''',
    dag=dag,
)

def create_service_test_task(service_name: str, task_group: TaskGroup, sleep_duration: int = 15, priority_weight: int = 1) -> BashOperator:
    """Create a test task for a microservice with proper error handling.
    
    Args:
        service_name: Name of the microservice to test
        task_group: Airflow task group to add the task to
        sleep_duration: Number of seconds to wait for server initialization (default: 15)
        priority_weight: Priority weight for task scheduling (default: 1)
    """
    return BashOperator(
        task_id=f'test_{service_name}',
        bash_command=f'''
            set -e
            cd /home/{user}/neo-services/{service_name}
            echo "Starting tests for {service_name}"
            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

            BUN_ENV=test bun run server.ts & SERVER_PID=$!
            sleep 15

            echo "Running tests..."
            set +e
            BUN_ENV=test npx jest --detectOpenHandles --forceExit
            TEST_EXIT=$?
            set -e
            echo "Waiting {sleep_duration} seconds for server to finish..."
            sleep {sleep_duration}
            echo "Shutting down server..."
            kill -15 $SERVER_PID 2>/dev/null || true
            sleep 3
            kill -0 $SERVER_PID 2>/dev/null && kill -9 $SERVER_PID 2>/dev/null || true
            wait $SERVER_PID 2>/dev/null || true
            echo "Tests completed for {service_name} with exit code $TEST_EXIT"
            exit $TEST_EXIT
        ''',
        task_group=task_group,
        #execution_timeout=timedelta(minutes=10 if service_name == "authentication" else 0, seconds=40),
        #queue='default', # Available options: default, high_priority, low_priority, celery
        dag=dag,
        trigger_rule=TriggerRule.ALWAYS,
        priority_weight=priority_weight,
    )

# Other microservices tests
with TaskGroup(group_id='test_job_service_centre', dag=dag) as test_job_service_centre:
    services = [
        'authentication',
        'activity-log-management', 
        'jobs-management',
        'service-centre-management',
    ]
    
    service_tasks = []
    for service in services:
        # Customize sleep duration and priority weight for specific services
        sleep_duration = 0
        priority_weight = 1
        if service == 'authentication':
            sleep_duration = 400
            priority_weight = 10    
        elif service == 'activity-log-management':
            sleep_duration = 200
            priority_weight = 10
        elif service == 'jobs-management':
            sleep_duration = 2
            priority_weight = 9
        elif service == 'service-centre-management':
            sleep_duration = 2
            priority_weight = 9
            
        task = create_service_test_task(service, test_job_service_centre, sleep_duration=sleep_duration, priority_weight=priority_weight)
        service_tasks.append(task)
    
    # Set dependencies within group
    # for i in range(len(service_tasks)-1):
    #     service_tasks[i] service_tasks[i+1]

with TaskGroup(group_id='test_user_customer', dag=dag) as test_user_customer:
    services = [
        'user-management',
        'customer-management',
    ]
    
    service_tasks = []
    for service in services:
        # Customize sleep duration and priority weight for specific services
        sleep_duration = 0
        priority_weight = 1
        if service == 'user-management':
            sleep_duration = 2
            priority_weight = 9
        elif service == 'customer-management':
            sleep_duration = 2
            priority_weight = 9
        
        task = create_service_test_task(service, test_user_customer, sleep_duration=sleep_duration, priority_weight=priority_weight)
        service_tasks.append(task)

    # Set dependencies within group
    # for i in range(len(service_tasks)-1):
    #     service_tasks[i] service_tasks[i+1]

with TaskGroup(group_id='test_notification', dag=dag) as test_notification:
    services = [
        'alert-config-management',
        'communication-service',
    ]
    
    service_tasks = []
    for service in services:
        # Customize sleep duration and priority weight for specific services
        sleep_duration = 0
        priority_weight = 1

        if service == 'alert-config-management':
            sleep_duration = 70
            priority_weight = 9
        elif service == 'communication-service':
            sleep_duration = 70
            priority_weight = 9
            
        task = create_service_test_task(service, test_notification, sleep_duration=sleep_duration, priority_weight=priority_weight)
        service_tasks.append(task)

    # Set dependencies within group
    # for i in range(len(service_tasks)-1):
    #     service_tasks[i] service_tasks[i+1]

with TaskGroup(group_id='test_analytics', dag=dag) as test_analytics:
    services = [
        'analytics-service',
    ]
    
    service_tasks = []
    for service in services:
        # Customize sleep duration and priority weight for specific services
        sleep_duration = 0
        priority_weight = 1
        
        if service == 'analytics-service':
            sleep_duration = 2
            priority_weight = 8
            
        task = create_service_test_task(service, test_analytics, sleep_duration=sleep_duration, priority_weight=priority_weight)
        service_tasks.append(task)

    # Set dependencies within group
    # for i in range(len(service_tasks)-1):
    #     service_tasks[i] service_tasks[i+1]

with TaskGroup(group_id='test_vehicle_firmware', dag=dag) as test_vehicle_firmware:
    services = [
        'vehicle-management',
        'firmware-management',
        'showroom-management',
    ]
    
    service_tasks = []
    for service in services:
        # Customize sleep duration and priority weight for specific services
        sleep_duration = 0
        priority_weight = 1

        if service == 'vehicle-management':
            sleep_duration = 150
            priority_weight = 7
        elif service == 'firmware-management':
            sleep_duration = 2
            priority_weight = 7
        elif service == 'showroom-management':
            sleep_duration = 2
            priority_weight = 7
            
        task = create_service_test_task(service, test_vehicle_firmware, sleep_duration=sleep_duration, priority_weight=priority_weight)
        service_tasks.append(task)

    # Set dependencies within group
    # for i in range(len(service_tasks)-1):
    #     service_tasks[i] service_tasks[i+1]



# Set trigger rule for all task groups to ensure proper completion
test_job_service_centre.trigger_rule = TriggerRule.ALWAYS
test_user_customer.trigger_rule = TriggerRule.ALWAYS
test_vehicle_firmware.trigger_rule = TriggerRule.ALWAYS
test_notification.trigger_rule = TriggerRule.ALWAYS
test_analytics.trigger_rule = TriggerRule.ALWAYS

# Set up dependencies between task groups to run sequentially
git_pull >> test_job_service_centre >> test_user_customer >>  test_notification >>  test_analytics >> test_vehicle_firmware   