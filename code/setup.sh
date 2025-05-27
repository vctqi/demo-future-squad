#!/bin/bash

# Exit on error
set -e

echo "Setting up Marketplace de Benefícios para Clientes PJ development environment..."

# Step 1: Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker before proceeding."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose before proceeding."
    exit 1
fi

# Step 2: Build and start containers
echo "Building and starting Docker containers..."
docker-compose build
docker-compose up -d

# Step 3: Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Step 4: Run database migrations
echo "Running database migrations..."
docker-compose exec backend npm run migrate:dev

# Step 5: Seed the database with initial data
echo "Seeding the database with initial data..."
docker-compose exec backend npm run seed

echo "Setup completed successfully! The application is now running at http://localhost:80"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:3001"
echo "Authentication Service: http://localhost:3002"
echo "Mock Banking API: http://localhost:3003"
echo "Grafana Dashboard: http://localhost:3005 (admin/admin)"