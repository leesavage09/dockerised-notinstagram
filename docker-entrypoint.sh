#!/bin/bash
set -e

mkdir -p /app/tmp/pids && rm -f /app/tmp/pids/server.pid

# Wait for PostgreSQL to be ready
until pg_isready -h "$NOTINSTAGRAM_DATABASE_HOST" -p "${NOTINSTAGRAM_DATABASE_PORT:-5432}" -U "$NOTINSTAGRAM_DATABASE_USER" -d "$NOTINSTAGRAM_DATABASE" -q 2>/dev/null; do
  echo "Waiting for PostgreSQL at $NOTINSTAGRAM_DATABASE_HOST:${NOTINSTAGRAM_DATABASE_PORT:-5432}..."
  sleep 2
done

echo "PostgreSQL is ready."

# Run migrations
bundle exec rails db:migrate

# Seed if database is empty (no users yet)
USER_COUNT=$(PGPASSWORD="$NOTINSTAGRAM_DATABASE_PASSWORD" psql -h "$NOTINSTAGRAM_DATABASE_HOST" -p "${NOTINSTAGRAM_DATABASE_PORT:-5432}" -U "$NOTINSTAGRAM_DATABASE_USER" -d "$NOTINSTAGRAM_DATABASE" -tAc "SELECT COUNT(*) FROM users" 2>/dev/null || echo "0")
echo "USER_COUNT: $USER_COUNT."
if [ "$USER_COUNT" = "0" ]; then
  echo "Empty database detected. Seeding..."
  bundle exec rails db:seed
fi

exec "$@"
