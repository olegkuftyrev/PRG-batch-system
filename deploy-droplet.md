# Droplet Deployment Guide

> **✅ DEPLOYED**: This application is currently running on DigitalOcean Droplet at http://134.199.223.99:8080
> 
> See [DEPLOYMENT.md](./DEPLOYMENT.md) for full production deployment details.

## Prerequisites

1. **Create a DigitalOcean Droplet**:
   - OS: Ubuntu 24.04 LTS
   - Size: Basic plan, 2GB RAM minimum
   - Enable IPv4 and add SSH keys

2. **Point your domain** to the Droplet's IP address (optional, for SSL)

## Initial Server Setup

### 1. Connect to Droplet

```bash
ssh root@your-droplet-ip
```

### 2. Install Docker and Docker Compose

```bash
# Update packages
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

### 3. Install Git

```bash
apt install git -y
```

### 4. Clone Repository

```bash
# Create app directory
mkdir -p /opt/prg-batch-system
cd /opt/prg-batch-system

# Clone repo
git clone https://github.com/olegkuftyrev/PRG-batch-system.git .

# Or use SSH if you have deploy keys set up
# git clone git@github.com:olegkuftyrev/PRG-batch-system.git .
```

### 5. Configure Environment

```bash
# Copy production env template
cp .env.production .env

# Edit with actual values
nano .env
```

Set these values in `.env`:
- `APP_KEY`: Generate with `openssl rand -base64 32`
- `POSTGRES_PASSWORD`: Strong password for database
- `POSTGRES_USER`: Database username (default: `prg`)
- `POSTGRES_DB`: Database name (default: `prg_batch`)

### 6. Build and Start Services

```bash
# Build all containers
docker compose build

# Start in detached mode
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

## Verify Deployment

### Check Services

```bash
# API health check
curl http://localhost:3333/health
# Expected: {"ok":true,"database":"connected"}

# Web frontend
curl http://localhost:8080
# Should return HTML

# View container logs
docker compose logs api
docker compose logs web
docker compose logs postgres
```

## Setup Nginx Reverse Proxy (Recommended)

### Install Nginx

```bash
apt install nginx -y
```

### Configure Nginx

```bash
# Create config
nano /etc/nginx/sites-available/prg-batch-system
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or IP

    # Frontend
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3333;
    }

    # WebSocket for Socket.io
    location /socket.io {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable the site:

```bash
# Create symlink
ln -s /etc/nginx/sites-available/prg-batch-system /etc/nginx/sites-enabled/

# Test config
nginx -t

# Reload nginx
systemctl reload nginx
```

## Setup SSL with Let's Encrypt (Optional)

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get certificate (replace with your domain)
certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
# Test renewal
certbot renew --dry-run
```

## Firewall Setup

```bash
# Install UFW
apt install ufw -y

# Allow SSH (important!)
ufw allow OpenSSH

# Allow HTTP and HTTPS
ufw allow 'Nginx Full'

# Enable firewall
ufw enable

# Check status
ufw status
```

## Updates and Maintenance

### Update Application

```bash
cd /opt/prg-batch-system

# Pull latest changes
git pull

# Rebuild and restart
docker compose down
docker compose build
docker compose up -d
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f web
docker compose logs -f postgres
```

### Backup Database

```bash
# Create backup
docker compose exec postgres pg_dump -U prg prg_batch > backup-$(date +%Y%m%d).sql

# Restore from backup
docker compose exec -T postgres psql -U prg prg_batch < backup-20260221.sql
```

### Restart Services

```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart api
docker compose restart web
```

## Troubleshooting

### Check if containers are running

```bash
docker compose ps
```

### View container logs

```bash
docker compose logs api
docker compose logs web
docker compose logs postgres
```

### Restart a specific service

```bash
docker compose restart api
```

### Rebuild after code changes

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Connect to database

```bash
docker compose exec postgres psql -U prg -d prg_batch
```

### Check disk space

```bash
df -h
docker system df
```

### Clean up Docker resources

```bash
# Remove unused containers, networks, images
docker system prune -a
```

## Monitoring

### Set up automatic monitoring (optional)

```bash
# Install htop for monitoring
apt install htop -y

# View running processes
htop
```

### Docker stats

```bash
# View container resource usage
docker stats
```

## Cost Estimate

- **Droplet**: $12-24/month (2-4GB RAM)
- **Domain** (optional): $10-15/year
- **Total**: ~$15-30/month

Much simpler and cheaper than App Platform for small projects!
