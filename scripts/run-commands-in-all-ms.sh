#!/bin/bash

# Automatically find all subdirectories in the current directory
projects=($(find . -maxdepth 1 -type d -not -name "."))

# Prompt the user to enter the command
read -p "Enter the command to run in each folder: " command_to_run

# Function to run the command in a directory if package.json exists
run_command_if_package_exists() {
  local project_dir="$1"
  local command="$2"

  if [ -d "$project_dir" ]; then
    if [ -f "$project_dir/package.json" ]; then
      echo "Found package.json in $project_dir"
      echo "Navigating to $project_dir"
      pushd "$project_dir" > /dev/null || { echo "Error: Could not navigate to $project_dir"; return 1; }

      echo "Running '$command' in $PWD"
      eval "$command"
      if [ $? -ne 0 ]; then
        echo "Error running '$command' in $PWD"
      fi

      popd > /dev/null
      echo "--------------------"
    else
      echo "package.json not found in $project_dir. Skipping."
      echo "--------------------"
    fi
  else
    echo "Error: Directory $project_dir does not exist."
    echo "--------------------"
  fi
}

# Loop through each found directory and run the command if package.json exists
for project in "${projects[@]}"; do
  run_command_if_package_exists "$project" "$command_to_run"
done

echo "Script finished."