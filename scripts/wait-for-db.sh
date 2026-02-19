#!/usr/bin/env bash
set -e

echo "Waiting for Postgres to be ready..."

until docker compose -f docker-compose.e2e.yml ps | grep "healthy" > /dev/null
do
  printf "."
  sleep 1
done

echo ""
echo "Postgres is ready!"