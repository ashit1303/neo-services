#!/bin/bash

# find all 
projects=($(find . -maxdepth 1 -type d -not -name "."))

# Function to check for package.json, navigate, and run commands using pushd/popd
check_and_run() {
  local project_dir="$1"

  if [ -d "$project_dir" ]; then
    if [ -f "$project_dir/package.json" ]; then
      echo "Found package.json in $project_dir"
      pushd "$project_dir" > /dev/null || { echo "Error: Could not navigate to $project_dir"; return 1; }
      echo "Running bun install in $PWD"
      bun install 
      if [ $? -ne 0 ]; then
        echo "Error: bun install failed in $PWD"
        popd > /dev/null
        return 1
      fi
      popd > /dev/null
    else
      echo "package.json not found in $project_dir"
    fi
  else
    echo "Error: Directory $project_dir does not exist"
  fi
}

# Loop through each found directory
for project in "${projects[@]}"; do
  check_and_run "$project"
  echo "--------------------"
done

echo "All dependencies Installed."