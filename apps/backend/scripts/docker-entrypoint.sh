#!/bin/sh
# Traveloop backend container entrypoint: wait for DB, migrate, optional seed, start app.
#
# Make executable after clone (local / CI): chmod +x backend/scripts/docker-entrypoint.sh
# The Dockerfile also runs: chmod +x scripts/docker-entrypoint.sh
#
# DATABASE_URL is read from the environment (e.g. docker-compose env / secrets).
set -e

if [ -z "${DATABASE_URL}" ]; then
  echo "ERROR: DATABASE_URL is not set." >&2
  exit 1
fi

echo "Waiting for PostgreSQL (pg_isready, max 30 attempts, 2s between)..."
max=30
i=0
while true; do
  if pg_isready -d "${DATABASE_URL}" -q 2>/dev/null; then
    echo "PostgreSQL is ready."
    break
  fi
  i=$((i + 1))
  if [ "$i" -ge "$max" ]; then
    echo "ERROR: PostgreSQL not ready after ${max} attempts." >&2
    exit 1
  fi
  echo "  attempt ${i}/${max}: not ready, sleeping 2s..."
  sleep 2
done

echo "Applying Prisma migrations (prisma/migrations/)..."
npx prisma migrate deploy

city_count="$(psql "${DATABASE_URL}" -t -A -c "SELECT COUNT(*)::bigint FROM cities;" | tr -d '[:space:]')"
if [ -z "${city_count}" ]; then
  echo "ERROR: could not read cities row count (psql returned empty)." >&2
  exit 1
fi

if [ "${city_count}" -eq 0 ]; then
  echo "Cities table is empty; running npm run seed..."
  npm run seed
else
  echo "Cities table has ${city_count} row(s); skipping seed."
fi

echo "Starting application..."
exec node dist/index.js
