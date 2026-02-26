# Deploy to DigitalOcean Droplet

**Status:** Already deployed at http://134.199.223.99:8080

Full production info: [DEPLOYMENT.md](./DEPLOYMENT.md)

## Before You Start

**Create droplet:**
- OS: Ubuntu 24.04 LTS
- Plan: Basic, 2GB RAM minimum
- Enable IPv4, add SSH key

**Optional:** Point domain to droplet IP (needed for SSL)

## Steps

### 1. Connect

```bash
ssh root@your-droplet-ip
```

### 2. Install Docker

```bash
apt update && apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt install docker-compose-plugin -y

# Verify
docker --version
docker compose version
```

### 3. Clone repo

```bash
apt install git -y
mkdir -p /opt/prg-batch-system
cd /opt/prg-batch-system
git clone https://github.com/olegkuftyrev/PRG-batch-system.git .
```

### 4. Configure environment

```bash
cp .env.production .env
nano .env
```

Set:
- `APP_KEY` → generate: `openssl rand -base64 32`
- `POSTGRES_PASSWORD` → strong random password
- `POSTGRES_USER` → `prg`
- `POSTGRES_DB` → `prg_batch`

### 5. Build and run

```bash
docker compose build
docker compose up -d
docker compose ps        # Check status
docker compose logs -f   # Watch logs
```

## Verify

**Check health:**
```bash
curl http://localhost:3333/health
# Should return: {"ok":true,"database":"connected"}

curl http://localhost:8080
# Should return: HTML

docker compose logs api
docker compose logs web
```

## Add Nginx Reverse Proxy (Optional)

**Install:**
```bash
apt install nginx -y
```

**Config file:**
```bash
nano /etc/nginx/sites-available/prg-batch-system
```

Paste:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    location /api {
        proxy_pass http://localhost:3333;
    }

    location /health {
        proxy_pass http://localhost:3333;
    }

    location /socket.io {
        proxy_pass http://localhost:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

**Enable:**
```bash
ln -s /etc/nginx/sites-available/prg-batch-system /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## Add SSL (Optional, requires domain)

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d your-domain.com
certbot renew --dry-run  # Test auto-renewal
```

## Setup Firewall

```bash
apt install ufw -y
ufw allow OpenSSH        # IMPORTANT: Allow SSH first
ufw allow 'Nginx Full'
ufw enable
ufw status
```

## Update App

```bash
cd /opt/prg-batch-system
git pull
docker compose down
docker compose build
docker compose up -d
```

## Maintenance

**View logs:**
```bash
docker compose logs -f           # All
docker compose logs -f api       # API only
docker compose logs -f postgres  # DB only
```

**Backup database:**
```bash
docker compose exec postgres pg_dump -U prg prg_batch > backup-$(date +%Y%m%d).sql
```

**Restore database:**
```bash
docker compose exec -T postgres psql -U prg prg_batch < backup-20260221.sql
```

**Restart services:**
```bash
docker compose restart      # All
docker compose restart api  # API only
```

## Troubleshooting

**Check containers:**
```bash
docker compose ps
```

**View logs:**
```bash
docker compose logs api
docker compose logs web
```

**Rebuild from scratch:**
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

**Connect to DB:**
```bash
docker compose exec postgres psql -U prg -d prg_batch
```

**Check disk:**
```bash
df -h
docker system df
```

**Clean Docker:**
```bash
docker system prune -a
```

## Monitor Resources

**Install htop:**
```bash
apt install htop -y
htop
```

**Docker stats:**
```bash
docker stats
```

## Cost

- Droplet (2GB RAM): $12/month
- Droplet (4GB RAM): $24/month
- Domain (optional): $10-15/year

Total: ~$15-30/month
