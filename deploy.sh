#!/bin/bash

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
docker compose -f docker-compose.prod.yml down || true

echo "🗑️ Cleaning up old images..."
docker image prune -f || true

echo "🚀 Starting production containers..."
docker compose -f docker-compose.prod.yml up -d

echo "📊 Deployment status:"
docker compose -f docker-compose.prod.yml ps

echo "✅ Deployment complete!"
echo "🌐 Application will be available at: https://$DOMAIN"
echo "📱 Backend API: https://$DOMAIN/api"
echo "🔍 Backend Health: https://$DOMAIN/actuator/health"

# Show logs
echo "📋 Recent logs:"
docker compose -f docker-compose.prod.yml logs --tail=20
