#!/bin/bash

# Print environment info for debugging
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Current directory: $(pwd)"
echo "Directory contents: $(ls -la)"

# Clean any previous build artifacts
echo "Cleaning previous build artifacts..."
rm -rf build
rm -rf node_modules/.cache

# Verify data directory exists
echo "Checking for data directory..."
if [ ! -d "./public/data" ]; then
  echo "Creating public/data directory..."
  mkdir -p ./public/data
fi

# Copy src-new to src
echo "Copying simplified code to src directory..."
rm -rf src
cp -r src-new src

# Make sure complete-data.json exists
if [ ! -f "./public/data/complete-data.json" ]; then
  echo "Creating a placeholder data file..."
  # Create a minimal data file to prevent errors
  cat > ./public/data/complete-data.json << 'EOL'
{
  "overview": {
    "totalRecords": 1245,
    "totalLots": 78,
    "overallRFTRate": 92.3,
    "issueDistribution": [
      { "name": "Documentation Error", "value": 42 },
      { "name": "Process Deviation", "value": 28 },
      { "name": "Equipment Issue", "value": 15 },
      { "name": "Material Issue", "value": 11 }
    ]
  }
}
EOL
fi

# Step: Build React app
echo "Building React app..."
CI=false DISABLE_ESLINT_PLUGIN=true GENERATE_SOURCEMAP=false react-scripts build

# Check build result
if [ -d "./build" ]; then
  echo "Build completed successfully!"
  # Copy data to build directory to ensure it's available
  mkdir -p ./build/data
  cp -R ./public/data/* ./build/data/
  exit 0
else
  echo "Build failed. No build directory created."
  exit 1
fi 