# PostgreSQL for Cloud Run (demo only).
# Listens on PORT so Cloud Run can reach the process. Use same env vars as docker-compose postgres.
FROM postgres:16-alpine

ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=postgres

# Cloud Run sets PORT (default 8080). Postgres uses PGPORT.
# So we listen on PORT to pass Cloud Run's port check.
ENV PGPORT=8080

# Cloud Run injects PORT (default 8080). Postgres respects PGPORT.
# Override so we set PGPORT from PORT then run the image entrypoint (initdb + postgres).
ENTRYPOINT []
CMD ["sh", "-c", "export PGPORT=${PORT:-5432} && exec docker-entrypoint.sh postgres"]
