# Deployment Guide (Ubuntu 22.04 / DigitalOcean 4 vCPU / 8 GB)

## 0. Prerequisites

- Ubuntu 22.04 LTS VPS
- Domain pointing A records to the VPS IP (root, www, api)
- Cloudflare in front (optional but recommended)
- Razorpay live keys, R2/S3 bucket

## 1. Initial server setup

```bash
sudo apt update && sudo apt -y upgrade
sudo apt -y install ufw fail2ban unattended-upgrades curl git
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 2. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
sudo apt -y install docker-compose-plugin
```

## 3. Clone & configure

```bash
git clone https://github.com/your-org/luxe-perfume.git /opt/luxe
cd /opt/luxe
cp .env.example .env
$EDITOR .env   # fill real values
```

## 4. SSL with Let's Encrypt (Cloudflare-friendly)

If you terminate TLS at Cloudflare, you can use Cloudflare's **Full (Strict)** mode with
an origin certificate. Otherwise:

```bash
sudo apt -y install certbot
sudo certbot certonly --standalone -d luxeperfume.in -d www.luxeperfume.in -d api.luxeperfume.in
```

Drop the issued certificates into `infra/nginx/certs/`:

```
infra/nginx/certs/
├── fullchain.pem
└── privkey.pem
```

Add a `443` server block to the nginx config with:

```nginx
listen 443 ssl http2;
ssl_certificate     /etc/nginx/certs/fullchain.pem;
ssl_certificate_key /etc/nginx/certs/privkey.pem;
ssl_protocols       TLSv1.2 TLSv1.3;
ssl_ciphers         HIGH:!aNULL:!MD5;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

## 5. Boot the stack

```bash
docker compose pull
docker compose up -d --build
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py seed
docker compose exec backend python manage.py collectstatic --noinput
```

## 6. Verify

```bash
curl -fsS https://api.luxeperfume.in/api/health/
curl -fsS https://luxeperfume.in
```

## 7. Backups

Postgres:
```bash
docker compose exec -T db pg_dump -U $POSTGRES_USER $POSTGRES_DB | gzip > /backups/luxe-$(date +%F).sql.gz
```

Add to `crontab -e`:
```
0 3 * * * /opt/luxe/scripts/backup.sh
```

## 8. Observability

- Sentry: set `SENTRY_DSN` in `.env` and restart backend.
- Uptime monitoring: UptimeRobot or Betterstack on `/api/health/`.

## 9. Updates

```bash
cd /opt/luxe
git pull
docker compose pull
docker compose up -d --build
docker compose exec backend python manage.py migrate
```

## 10. Cloudflare configuration

- DNS: A records → VPS IP, proxied (orange cloud).
- SSL/TLS: **Full (Strict)**.
- Page Rules: cache static assets, bypass `/api/*` and `/admin/*`.
- Speed → Auto Minify: HTML, CSS, JS.
- Speed → Brotli: On.
- Network → HTTP/3: On.

## 11. Razorpay webhook

In the Razorpay dashboard, add a webhook:

- URL: `https://api.luxeperfume.in/api/payments/webhook/razorpay/`
- Events: `payment.captured`, `order.paid`, `refund.processed`
- Secret: same as `RAZORPAY_WEBHOOK_SECRET` in `.env`
