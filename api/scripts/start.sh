#!/bin/sh
set -e

echo "Running database migrations..."
node build/ace.js migration:run --force

echo "Starting server..."
exec node build/bin/server.js
