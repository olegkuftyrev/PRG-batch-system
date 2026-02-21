#!/bin/sh
set -e

echo "Starting server..."
echo "Note: Run migrations manually with: docker-compose exec api node bin/server.js"
exec node build/bin/server.js
