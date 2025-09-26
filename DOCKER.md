# Docker Configuration for Task Manager

This document explains how to run the Task Manager application using Docker containers.

## 🐳 Overview

The application consists of two Docker containers:
- **Backend**: Spring Boot application (Java 11) running on port 8080
- **Frontend**: Angular application served by Nginx on port 80/3000

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB RAM available for containers
- Ports 8080 and 80/3000 available

## 🚀 Quick Start (Local Development)

1. **Clone the repository and navigate to project root:**
   ```bash
   cd task_manager
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

4. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost:8080
   - Health Check: http://localhost:8080/actuator/health

## 🏭 Production Deployment (EC2)

### For EC2 deployment (3.20.15.201) with domain (veri-assessment.tinashe.website):

1. **Deploy using the production compose:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Or use the deployment script:**
   ```bash
   ./deploy.sh
   ```

3. **The application will be available at:**
   - Frontend: http://localhost:3000 (proxied by Nginx)
   - Backend: http://localhost:8080
   - Domain: https://veri-assessment.tinashe.website

### Production Configuration

The production setup includes:
- **Optimized builds** with multi-stage Dockerfiles
- **Health checks** for both services
- **Logging configuration** with rotation
- **Proper networking** between containers
- **Environment variables** for domain configuration

## 🔧 Configuration

### Environment Variables

**Backend:**
- `SPRING_PROFILES_ACTIVE`: Set to `docker` or `prod`
- `SERVER_PORT`: Port for Spring Boot (default: 8080)
- `DOMAIN_NAME`: Your domain name for production

**Frontend:**
- `API_URL`: Backend API URL (auto-configured based on environment)

### Custom Configuration

1. **Modify backend properties:**
   Edit `backend/src/main/resources/application-docker.properties`

2. **Update frontend API endpoint:**
   Environment variables are injected at runtime via `docker-entrypoint.sh`

3. **Nginx configuration:**
   Modify `frontend/nginx.conf` for custom routing or security headers

## 🛠️ Development Commands

### Build Images Manually
```bash
# Build backend
docker build -t task-manager-backend ./backend

# Build frontend
docker build -t task-manager-frontend ./frontend
```

### Container Management
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service_name]

# Restart a service
docker-compose restart [service_name]

# Shell into container
docker-compose exec backend bash
docker-compose exec frontend sh
```

### Database Access
```bash
# H2 Console (development only)
# Access: http://localhost:8080/h2-console
# JDBC URL: jdbc:h2:mem:testdb
# Username: sa
# Password: (empty)
```

## 📊 Monitoring & Health Checks

### Health Endpoints
- **Backend**: `GET /actuator/health`
- **Frontend**: `GET /health`

### Container Health Status
```bash
docker-compose ps
```

### View Container Resources
```bash
docker stats
```

## 🔍 Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check what's using the port
   lsof -i :8080
   lsof -i :80
   ```

2. **Container won't start:**
   ```bash
   # Check logs
   docker-compose logs [service_name]

   # Rebuild containers
   docker-compose up --build -d
   ```

3. **Frontend can't reach backend:**
   - Verify both containers are in the same network
   - Check API_URL environment variable
   - Ensure backend health check passes

4. **Permission issues:**
   ```bash
   # Fix deploy script permissions
   chmod +x deploy.sh
   ```

### Reset Everything
```bash
# Stop all containers and remove everything
docker-compose down -v
docker system prune -a
docker volume prune
```

## 🔒 Security Notes

### Production Security
- Containers run with non-root users
- Nginx serves static files with security headers
- HTTPS is handled by external reverse proxy (your Nginx config)
- No sensitive data in environment variables

### Network Security
- Containers communicate via internal Docker network
- Only necessary ports are exposed
- API endpoints are proxied through frontend container

## 📁 File Structure

```
task_manager/
├── backend/
│   ├── Dockerfile              # Multi-stage backend build
│   └── src/...
├── frontend/
│   ├── Dockerfile              # Multi-stage frontend build
│   ├── nginx.conf              # Nginx configuration
│   ├── docker-entrypoint.sh    # Runtime environment setup
│   └── src/...
├── docker-compose.yml          # Development environment
├── docker-compose.prod.yml     # Production environment
├── deploy.sh                   # Production deployment script
└── DOCKER.md                   # This documentation
```

## 🚀 Production Deployment Checklist

- [ ] Update `veri-assessment.tinashe.website` DNS to point to 3.20.15.201
- [ ] Configure Nginx reverse proxy at `/etc/nginx/sites-enabled/veri-assessment.tinashe.website`
- [ ] Set up SSL certificates (Let's Encrypt recommended)
- [ ] Run `./deploy.sh` on EC2 instance
- [ ] Verify health checks pass
- [ ] Test frontend and backend connectivity
- [ ] Monitor logs for any issues

## 📞 Support

For deployment issues:
1. Check container logs: `docker-compose logs -f`
2. Verify health endpoints
3. Test network connectivity between containers
4. Review Nginx configuration for reverse proxy setup