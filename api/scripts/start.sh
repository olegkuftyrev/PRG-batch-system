#!/bin/sh
set -e

echo "Running migrations..."
node build/scripts/run-migrations.js

echo "Starting server..."
exec node build/bin/server.js
