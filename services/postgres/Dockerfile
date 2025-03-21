# Use the official PostgreSQL image from Docker Hub
FROM postgres:16.3-alpine

# Set environment variables for PostgreSQL (optional)
ENV POSTGRES_USER=postgresuser
ENV POSTGRES_PASSWORD=mysecretpassword
ENV POSTGRES_DB=mydatabase

# Optional: Copy initialization scripts into the container
# If you have custom initialization scripts for your database, you can include them here
# COPY ./init.sql /docker-entrypoint-initdb.d/

# Expose PostgreSQL port (default: 5432)
EXPOSE 5432