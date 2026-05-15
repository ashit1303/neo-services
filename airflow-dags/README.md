# Airflow DAGs Documentation

## Test Microservices Daily DAG

This DAG runs automated tests for all microservices in the Myfortlio platform on a daily basis.

### Overview

- **DAG Name**: daily-runner
- **Schedule**: Daily at midnight (0 0 * * *)
- **Tags**: testing, microservices

### Flow Description

1. **Git Pull**: 
   - Pulls latest code changes
   - If changes detected, waits 5 minutes before proceeding
   - Ensures latest code is being tested

2. **Service Testing**:
   - Services are tested in a specific sequence to handle dependencies
   - Each service:
     - Starts up in local environment
     - Waits for initialization
     - Runs Jest tests
     - Gracefully shuts down

3. **Cleanup**:
   - Final task ensures all services are properly terminated
   - Uses pkill to clean up any remaining processes

