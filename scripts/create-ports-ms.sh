#!/bin/bash

output_file="./ports.ini"
> "$output_file" # Clear the file if it exists

for dir in */; do
  folder_name=$(basename "$dir" | tr -d '/') # Remove trailing slash
  dockerfile="$dir/Dockerfile"

  if [ -f "$dockerfile" ]; then
    port=$(grep "EXPOSE" "$dockerfile" | awk '{print $2}' | head -n 1)
    if [ -n "$port" ]; then
      echo "[$folder_name]" >> "$output_file"
      echo "$port" >> "$output_file"
    else
      echo "No EXPOSE port found in $dockerfile for $folder_name"
    fi
  else
    echo "No Dockerfile found in $dir"
  fi
done

echo "✅ ports.ini file generated successfully."