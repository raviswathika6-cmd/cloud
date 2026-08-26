# Expense Management App - Deployment Guide

## Table of Contents
1. [Quick Start with Docker](#quick-start-with-docker)
2. [Manual Deployment](#manual-deployment)
3. [Cloud Deployments](#cloud-deployments)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [Monitoring & Maintenance](#monitoring--maintenance)

## Quick Start with Docker

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- Stripe account with API keys

### Running with Docker Compose

1. **Clone and setup**
```bash
cd expense-management-app
cp .env.example .env
# Edit .env with your Stripe keys and JWT secret
```

2. **Start all services**
```bash
docker-compose up -d
```

3. **Verify services**
```bash
docker-compose ps
docker-compose logs app
```

4. **Run database migrations**
```bash
# Already handled by docker-compose, but if needed:
docker-compose exec postgres psql -U postgres -d expense_db -f /docker-entrypoint-initdb.d/01-schema.sql
```

5. **Access the application**
- API: `http://localhost:5000`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

### Stopping services
```bash
docker-compose down

# Remove volumes too (warning: deletes data)
docker-compose down -v
```

## Manual Deployment

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### Step-by-step Installation

1. **Install Node dependencies**
```bash
npm install
```

2. **Setup PostgreSQL**
```bash
# Create database
createdb expense_db

# Load schema
psql -U postgres -d expense_db -f database/schema.sql

# Verify
psql -U postgres -d expense_db -c "\dt"
```

3. **Configure environment**
```bash
cp .env.example .env
nano .env  # Edit with your values
```

4. **Build application**
```bash
npm run build
```

5. **Start server**
```bash
npm start
```

6. **Verify health**
```bash
curl http://localhost:5000/health
```

## Cloud Deployments

### Heroku Deployment

1. **Install Heroku CLI**
```bash
curl https://cli.heroku.com/install.sh | sh
heroku login
```

2. **Create Heroku app**
```bash
heroku create your-expense-app
```

3. **Add PostgreSQL**
```bash
heroku addons:create heroku-postgresql:standard-0
```

4. **Set environment variables**
```bash
heroku config:set JWT_SECRET=your-secret-key
heroku config:set STRIPE_SECRET_KEY=sk_live_...
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_...
```

5. **Deploy**
```bash
git push heroku main
```

6. **View logs**
```bash
heroku logs --tail
```

### AWS ECS Deployment

1. **Create ECR repository**
```bash
aws ecr create-repository --repository-name expense-app --region us-east-1
```

2. **Build and push Docker image**
```bash
docker build -t expense-app .
docker tag expense-app:latest [AWS_ACCOUNT].dkr.ecr.us-east-1.amazonaws.com/expense-app:latest
docker push [AWS_ACCOUNT].dkr.ecr.us-east-1.amazonaws.com/expense-app:latest
```

3. **Create ECS task definition** (see AWS documentation)

4. **Deploy to ECS**
```bash
aws ecs create-service --cluster expense-cluster --service-name expense-app ...
```

### DigitalOcean App Platform

1. **Connect GitHub**
   - Go to DigitalOcean App Platform
   - Connect your GitHub account
   - Select repository

2. **Configure app.yaml**
```yaml
name: expense-app
services:
- name: api
  github:
    repo: yourusername/expense-management-app
    branch: main
  build_command: npm run build
  run_command: npm start
  envs:
  - key: NODE_ENV
    value: production
  - key: DB_HOST
    scope: RUN_TIME
```

3. **Add database**
   - Add PostgreSQL component
   - Link to app

4. **Deploy**
   - Click "Deploy" button

## Database Setup

### PostgreSQL Initial Setup

1. **Create dedicated user**
```sql
CREATE USER expense_user WITH PASSWORD 'secure-password';
ALTER ROLE expense_user SET client_encoding TO 'utf8';
ALTER ROLE expense_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE expense_user SET default_transaction_deferrable TO on;
ALTER ROLE expense_user SET timezone TO 'UTC';
```

2. **Create database**
```sql
CREATE DATABASE expense_db OWNER expense_user;
```

3. **Grant privileges**
```sql
GRANT CREATE ON DATABASE expense_db TO expense_user;
\c expense_db
GRANT USAGE ON SCHEMA public TO expense_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO expense_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO expense_user;
```

4. **Load schema**
```bash
psql -U expense_user -d expense_db -f database/schema.sql
```

### Backup Strategy

**Daily backups**
```bash
# Script: backup.sh
#!/bin/bash
BACKUP_DIR="/backups/expense_db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump -U expense_user -d expense_db | gzip > $BACKUP_DIR/backup_$TIMESTAMP.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

**Automate with cron**
```bash
0 2 * * * /path/to/backup.sh
```

## Environment Configuration

### Required Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=expense_db
DB_USER=expense_user
DB_PASSWORD=your-secure-password

# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# Security
JWT_SECRET=generate-a-strong-random-string-min-32-chars
JWT_EXPIRY=24h

# Stripe
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=app-specific-password
```

### Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Monitoring & Maintenance

### Health Checks

```bash
# Check server health
curl https://yourdomain.com/health

# Check database
psql -U expense_user -d expense_db -c "SELECT 1"
```

### Logging

**View application logs**
```bash
# Docker
docker-compose logs -f app

# Systemd service
journalctl -u expense-app -f

# File logs
tail -f /var/log/expense-app.log
```

### Performance Monitoring

**Database query performance**
```sql
-- Slow query log
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
WHERE mean_time > 100 
ORDER BY mean_time DESC;
```

**Database connections**
```sql
SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;
```

### Common Issues

**Connection refused**
```bash
# Check if database is running
pg_isready -h localhost -p 5432 -U postgres

# Check if service is running
systemctl status expense-app
```

**Out of memory**
```bash
# Check memory usage
docker stats

# Increase heap size
NODE_OPTIONS=--max-old-space-size=2048 npm start
```

**High disk usage**
```bash
# Check webhook logs table
SELECT COUNT(*) FROM webhooks;

# Archive old webhooks
DELETE FROM webhooks WHERE created_at < NOW() - INTERVAL '90 days';
```

### Scheduled Maintenance

**Weekly database maintenance**
```bash
# VACUUM and ANALYZE
psql -U expense_user -d expense_db -c "VACUUM ANALYZE;"
```

**Monthly cleanup**
```bash
# Archive old summaries
DELETE FROM expense_summaries WHERE created_at < NOW() - INTERVAL '1 year';

# Archive old webhook logs
DELETE FROM webhooks WHERE created_at < NOW() - INTERVAL '6 months';
```

### SSL/TLS Configuration

**Using Let's Encrypt with Nginx**
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Request certificate
sudo certbot certonly --nginx -d yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Rate Limiting Configuration

Adjust in `.env`:
```env
RATE_LIMIT_WINDOW_MS=900000     # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100     # requests per window
```

### Security Hardening

1. **Enable HTTPS only**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
}
```

2. **Update security headers**
In `server.ts`, helmet is already configured. Customize as needed:
```typescript
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"]
        }
    }
}));
```

3. **Regular updates**
```bash
npm audit fix
npm update
```

## Support & Troubleshooting

- Check logs: `docker-compose logs`
- Database issues: `pg_stat_activity`
- API testing: Use Postman or Insomnia
- Documentation: See main README.md

For detailed support, create an issue in the repository.
