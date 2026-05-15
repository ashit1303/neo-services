#!/bin/bash

alias docker='podman'

# Ensure a project name is provided
if [ -z "$1" ]; then
  echo "Usage: ./deploy-microservice.sh <project-folder>"
  exit 1
fi

project_dir="./$1"
container_name="$1"
image_name="fortlio-$1"
TEMP_IMAGE_DIR="/tmp/docker_images"
mkdir -p "$TEMP_IMAGE_DIR"

# Read port from ini file
ini_file="./ports.ini"
escaped_section=$(echo "$1" | sed 's/[]\/$*.^[]/\\&/g')
port=$(awk -v section="$escaped_section" 'BEGIN{found=0} $0 ~ "\\["section"\\]" {found=1; next} found && /^[0-9]+$/ {print $0; exit}' "$ini_file")

if [ -z "$port" ]; then
  echo "Error: Port not found for $1 in $ini_file"
  exit 1
fi

# Loki URL for logging
loki_url='http://13.203.138.121:3100/loki/api/v1/push'

echo "Starting deployment for: $project_dir on port $port"

if [ ! -d "$project_dir" ]; then
  echo "Error: Directory $project_dir does not exist."
  exit 1
fi

# Stop running container
if docker ps -q -f name="$container_name" > /dev/null; then
  echo "Stopping container '$container_name'..."
  docker stop "$container_name"
fi

# Remove existing container
if docker ps -aq -f name="$container_name" > /dev/null; then
  echo "Removing container '$container_name'..."
  docker remove "$container_name"
fi

# Move old docker image to temp if exists
if docker images -q "$image_name" > /dev/null; then
  # echo "Saving old image '$image_name' to temp..."
  # docker save "$image_name" -o "$TEMP_IMAGE_DIR/${image_name}.tar"
  echo "Removing docker existing docker image '$image_name'..."
  docker rmi "$image_name"
fi

# Build new docker image
echo "Building docker image '$image_name'..."
docker build -f "$project_dir/Dockerfile" -t "$image_name" .
if [ $? -ne 0 ]; then
  echo "Build failed. Attempting to restore old image..."
  if [ -f "$TEMP_IMAGE_DIR/${image_name}.tar" ]; then
    docker load -i "$TEMP_IMAGE_DIR/${image_name}.tar"
    echo "Old image restored."
  fi
  exit 1
fi

# Run the container with Loki logging and port mapping
echo "Running new container '$container_name' on port $port..."
docker run -d \
  --name "$container_name" \
  --log-driver=loki \
  --log-opt loki-url="$loki_url" \
  --log-opt loki-external-labels="container_name=$container_name" \
  -p "$port:$port" \
  "$image_name"

echo "✅ Deployment complete for '$container_name'"
