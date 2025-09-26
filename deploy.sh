#!/bin/bash

# Production deployment script for EC2
# Usage: ./deploy.sh

set -e  # Exit on any error

echo "🚀 Starting deployment to EC2..."

# Configuration
DOMAIN="veri-assessment.tinashe.website"
EC2_HOST="3.20.15.201"

echo "📦 Building Docker images..."

# Build backend
echo "Building backend image..."
docker build -t task-manager-backend:latest ./backend

# Build frontend
echo "Building frontend image..."
docker build -t task-manager-frontend:latest ./frontend

echo "🔄 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down || true

echo "🗑️ Cleaning up old images..."
docker image prune -f || true

echo "🚀 Starting production containers..."
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting for services to be healthy..."
sleep 30

# Health checks
echo "🏥 Checking backend health..."
until curl -f http://localhost:8080/actuator/health; do
    echo "Backend not ready yet... waiting 10s"
    sleep 10
done

echo "🏥 Checking frontend health..."
until curl -f http://localhost:3000/health; do
    echo "Frontend not ready yet... waiting 10s"
    sleep 10
done

echo "📊 Deployment status:"
docker-compose -f docker-compose.prod.yml ps

echo "✅ Deployment complete!"
echo "🌐 Application will be available at: https://$DOMAIN"
echo "📱 Backend API: https://$DOMAIN/api"
echo "🔍 Backend Health: https://$DOMAIN/actuator/health"

# Show logs
echo "📋 Recent logs:"
docker-compose -f docker-compose.prod.yml logs --tail=20