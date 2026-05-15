#!/bin/bash

# Get the current username
user=$(whoami)

# Define DAG directories using the dynamic username
dag_dirs=(
  "/home/$user/neo-services/airflow-dags"
  # "/home/$user/airflow-dags"
)

airflow_dag_dir="/home/$user/airflow/dags"

mkdir -p $airflow_dag_dir
# Create symlinks if they don't exist
echo "Creating new symlinks..."
for dir in "${dag_dirs[@]}"; do
  find "$dir" -name "*.py" | while read -r file; do
    symlink="$airflow_dag_dir/$(basename "$file")"
    [ -L "$symlink" ] || {
      ln -s "$file" "$symlink"
      echo "New symlink created: $symlink"
    }
  done
done

# Check for broken symlinks and remove them
echo "Checking for broken symlinks..."
find "$airflow_dag_dir" -type l ! -exec test -e {} \; -not -path "*/__pycache__/*" -print | while read -r broken_symlink; do
  echo "Removing broken symlink: $broken_symlink"
  rm "$broken_symlink"
done

echo "DAG refresh complete."
