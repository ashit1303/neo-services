#!/bin/bash

echo "🔍 Checking for changes in microservice directories..."

# Automatically find all microservice dirs (that contain package.json)
microservice_dirs=()
for dir in */; do
  if [ -f "$dir/package.json" ]; then
    microservice_dirs+=("${dir%/}") # remove trailing slash
  fi
done

# Function to run lint:fix in a given directory
run_lint() {
  local dir="$1"
  echo -e "\n📦 Changes detected in '$dir'. Running bun run lint:fix..."

  if cd "$dir" && bun run lint:fix --if-present; then
    echo -e "✅ Linting in '$dir' completed successfully.\n"

    # Detect modified files after linting and stage only those
    changed_files=$(git diff --name-only)
    if [[ -n "$changed_files" ]]; then
      echo -e "📝 Files changed after linting:\n$changed_files"

      git add .
    else
      echo "👌 No file changes after linting."
    fi

    cd - > /dev/null 2>&1
    return 0
  else
    echo "❌ Error running lint:fix in '$dir'."
    cd - > /dev/null 2>&1
    return 1
  fi
}

# Get the list of staged files
staged_files=$(git diff --cached --name-only --diff-filter=ACM)

# 🛑 Exit early if nothing is staged
if [[ -z "$staged_files" ]]; then
  echo "⚠️  No staged files found. Skipping linting."
  exit 0
fi

# Track linting status
lint_success=true

# Loop through detected microservices and check for changes
for dir in "${microservice_dirs[@]}"; do
  for file in $staged_files; do
    if [[ "$file" == "$dir/"* ]]; then
      if ! run_lint "$dir"; then
        lint_success=false
      fi
      break
    fi
  done
done

# Show result summary
if ! $lint_success; then
  echo -e "\n🚫 Commit aborted due to linting errors in one or more microservices."
  exit 1
fi

echo -e "\n🎉 Linting completed and changes (if any) added to commit."
echo "✅ Continuing with commit..."
exit 0
