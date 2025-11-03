# Docker Deployment Guide

This guide explains how to deploy the WhatsApp Gateway API using Docker.

## Prerequisites

- Docker (v20.10+)
- Docker Compose (v2.0+)

## Quick Start

1. **Clone the repository**

```bash
git clone https://github.com/Zytkaa/whastapp-gateway.git
cd whastapp-gateway
```

2. **Configure environment variables**

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your production values:

```env
PORT=3000
NODE_ENV=production

DB_USER=root
DB_PASSWORD=your-secure-password
DB_NAME=whatsapp_gateway

JWT_SECRET=your-super-secret-jwt-key-change-this
API_KEY=your-api-key-here
```

3. **Start all services**

```bash
docker-compose up -d
```

This will start:
- WhatsApp Gateway API (port 3000)
- MySQL database (port 3306)
- Redis (port 6379)

4. **Check if services are running**

```bash
docker-compose ps
```

5. **View logs**

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
```

6. **Initialize the database**

The database will be automatically created, but you need to push the schema:

```bash
docker-compose exec app npm run db:push
```

7. **Access the API**

- API: http://localhost:3000
- API Documentation: http://localhost:3000/api-docs
- Health Check: http://localhost:3000/health

## Managing the Application

### Stop services

```bash
docker-compose down
```

### Stop and remove volumes (database data)

```bash
docker-compose down -v
```

### Restart services

```bash
docker-compose restart
```

### Rebuild after code changes

```bash
docker-compose up -d --build
```

### Scale the application

```bash
docker-compose up -d --scale app=3
```

## Production Deployment

### 1. Update environment variables

Ensure all secrets are changed from defaults:
- `JWT_SECRET` - Use a strong random string
- `DB_PASSWORD` - Use a strong database password
- `API_KEY` - Generate a secure API key

### 2. Use external database (recommended)

Modify `docker-compose.yml` to point to your production MySQL:

```yaml
services:
  app:
    environment:
      - DB_HOST=your-production-db-host.com
      - DB_PORT=3306
      - DB_USER=your-db-user
      - DB_PASSWORD=your-db-password
```

Remove the `mysql` service section.

### 3. Use SSL/TLS

Add a reverse proxy (nginx) in front of the application:

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
```

### 4. Enable logging to external service

Configure Winston to send logs to a logging service like Loggly or Papertrail.

### 5. Set up monitoring

Use tools like:
- Prometheus + Grafana for metrics
- Sentry for error tracking
- Uptime monitoring services

## Database Backups

### Manual backup

```bash
docker-compose exec mysql mysqldump -u root -p whatsapp_gateway > backup.sql
```

### Automated backups

Add a backup service to `docker-compose.yml`:

```yaml
services:
  backup:
    image: databack/mysql-backup
    environment:
      - DB_SERVER=mysql
      - DB_USER=root
      - DB_PASS=${DB_PASSWORD}
      - DB_NAMES=whatsapp_gateway
      - DB_DUMP_FREQ=1440  # Every 24 hours
      - DB_CLEANUP_TIME=2880  # Keep 2 days
    volumes:
      - ./backups:/db
    depends_on:
      - mysql
```

## Monitoring

### Check resource usage

```bash
docker stats
```

### View application logs

```bash
# Live logs
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app
```

### Access container shell

```bash
docker-compose exec app sh
```

## Troubleshooting

### Database connection issues

```bash
# Check MySQL is running
docker-compose ps mysql

# Check MySQL logs
docker-compose logs mysql

# Test connection
docker-compose exec app ping mysql
```

### Redis connection issues

```bash
# Check Redis is running
docker-compose ps redis

# Check Redis logs
docker-compose logs redis

# Test Redis connection
docker-compose exec redis redis-cli ping
```

### Application won't start

```bash
# Check application logs
docker-compose logs app

# Rebuild the image
docker-compose build --no-cache app
docker-compose up -d
```

### Port already in use

Change the port in `.env` or `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Use port 3001 instead
```

## Security Best Practices

1. **Never expose MySQL and Redis ports in production**
   
   Remove the `ports` section for mysql and redis in production:
   
   ```yaml
   mysql:
     # Remove: ports: - "3306:3306"
   ```

2. **Use secrets management**
   
   Use Docker secrets or environment variable encryption.

3. **Run as non-root user**
   
   Update Dockerfile:
   
   ```dockerfile
   RUN addgroup -g 1001 -S nodejs
   RUN adduser -S nodejs -u 1001
   USER nodejs
   ```

4. **Regularly update images**
   
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

5. **Enable firewall rules**
   
   Only allow necessary ports through your firewall.

## Performance Optimization

### 1. Use production Node.js image

```dockerfile
FROM node:18-alpine AS builder
# ... build steps

FROM node:18-alpine
# ... copy built files
```

### 2. Enable Redis persistence

```yaml
redis:
  command: redis-server --appendonly yes
```

### 3. Increase resource limits

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## Kubernetes Deployment

For production at scale, consider deploying to Kubernetes. Example manifests are available in the `k8s/` directory (to be created).

## Support

For deployment issues:
1. Check logs first
2. Review this guide
3. Check Docker and Docker Compose documentation
4. Open an issue on GitHub
