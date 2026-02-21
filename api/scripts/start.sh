#!/bin/sh
set -e

echo "Running database migrations..."
node ace migration:run --force

echo "Starting server..."
exec node build/bin/server.js
