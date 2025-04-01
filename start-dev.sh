#!/bin/bash

# Copy the src-new directory to src
echo "Copying simplified code from src-new to src..."
rm -rf src
cp -r src-new src

# Ensure data directory exists
echo "Checking data directory..."
if [ ! -d "./public/data" ]; then
  echo "Creating public/data directory..."
  mkdir -p ./public/data
fi

# Ensure complete-data.json exists
if [ ! -f "./public/data/complete-data.json" ]; then
  echo "The complete-data.json file is missing, creating a minimal version..."
  cp -f public/data/complete-data.json.example public/data/complete-data.json
fi

# Start the development server
echo "Starting development server..."
npm start 