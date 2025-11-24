# Hướng dẫn Deploy chi tiết

## 🚀 Deploy lên Vercel (Khuyến nghị)

### Bước 1: Chuẩn bị Database

Vercel không hỗ trợ SQLite. Bạn cần sử dụng PostgreSQL.

#### Option A: Vercel Postgres

1. Vào Vercel Dashboard
2. Chọn project → Storage → Create Database
3. Chọn Postgres
4. Copy connection string

#### Option B: Supabase (Free tier tốt)

1. Truy cập https://supabase.com
2. Tạo project mới
3. Vào Settings → Database
4. Copy connection string (URI mode)

#### Option C: Neon (Serverless Postgres)

1. Truy cập https://neon.tech
2. Tạo project mới
3. Copy connection string

### Bước 2: Cập nhật Prisma Schema

Trong `prisma/schema.prisma`, đổi:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Bước 3: Deploy lên Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

Hoặc deploy qua GitHub:

1. Push code lên GitHub
2. Vào https://vercel.com/new
3. Import repository
4. Cấu hình Environment Variables (xem bước 4)
5. Deploy

### Bước 4: Environment Variables

Thêm các biến sau trong Vercel Dashboard:

```
DATABASE_URL=postgresql://user:pass@host:5432/db
TEMPMAIL_DOMAIN=yourdomain.com
NEXT_PUBLIC_TEMPMAIL_DOMAIN=yourdomain.com
MAILBOX_TTL_MINUTES=60
INBOUND_WEBHOOK_SECRET=your-secure-random-string
INTERNAL_API_SECRET=another-secure-string
```

### Bước 5: Run Migration

Sau khi deploy, chạy migration:

```bash
# Locally với production database
DATABASE_URL="your-production-db-url" npx prisma migrate deploy
```

Hoặc thêm vào build command trong Vercel:

```bash
prisma generate && prisma migrate deploy && next build
```

### Bước 6: Cấu hình Domain

1. Thêm custom domain trong Vercel
2. Cập nhật DNS records
3. Cấu hình MX records cho email

## 🚂 Deploy lên Railway

### Bước 1: Tạo Project

1. Truy cập https://railway.app
2. New Project → Deploy from GitHub repo
3. Chọn repository

### Bước 2: Thêm PostgreSQL

1. Click "New" → Database → PostgreSQL
2. Railway tự động tạo `DATABASE_URL`

### Bước 3: Environment Variables

Thêm các biến:

```
TEMPMAIL_DOMAIN=yourdomain.com
NEXT_PUBLIC_TEMPMAIL_DOMAIN=yourdomain.com
MAILBOX_TTL_MINUTES=60
INBOUND_WEBHOOK_SECRET=your-secret
```

### Bước 4: Cấu hình Build

Railway tự động detect Next.js. Nếu cần custom:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### Bước 5: Deploy

Railway tự động deploy khi push code.

## 🎨 Deploy lên Render

### Bước 1: Tạo Web Service

1. Truy cập https://render.com
2. New → Web Service
3. Connect repository

### Bước 2: Cấu hình

- **Name:** tempmail-app
- **Environment:** Node
- **Build Command:** `npm install && npx prisma generate && npm run build`
- **Start Command:** `npm start`

### Bước 3: Thêm PostgreSQL

1. New → PostgreSQL
2. Copy Internal Database URL

### Bước 4: Environment Variables

Thêm trong Web Service settings:

```
DATABASE_URL=<internal-database-url>
TEMPMAIL_DOMAIN=yourdomain.com
NEXT_PUBLIC_TEMPMAIL_DOMAIN=yourdomain.com
MAILBOX_TTL_MINUTES=60
INBOUND_WEBHOOK_SECRET=your-secret
```

### Bước 5: Deploy

Click "Create Web Service"

## 🖥️ Deploy lên VPS (Ubuntu)

### Bước 1: Cài đặt Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2
```

### Bước 2: Cấu hình PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE tempmail;
CREATE USER tempmail_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE tempmail TO tempmail_user;
\q
```

### Bước 3: Clone và Setup Project

```bash
# Clone project
cd /var/www
sudo git clone <your-repo-url> tempmail-app
cd tempmail-app

# Install dependencies
sudo npm install

# Create .env
sudo nano .env
```

Thêm vào `.env`:

```env
DATABASE_URL="postgresql://tempmail_user:secure_password@localhost:5432/tempmail"
TEMPMAIL_DOMAIN="yourdomain.com"
NEXT_PUBLIC_TEMPMAIL_DOMAIN="yourdomain.com"
MAILBOX_TTL_MINUTES="60"
INBOUND_WEBHOOK_SECRET="your-secure-secret"
```

### Bước 4: Build và Run

```bash
# Generate Prisma client
sudo npx prisma generate

# Run migrations
sudo npx prisma migrate deploy

# Build
sudo npm run build

# Start with PM2
sudo pm2 start npm --name "tempmail" -- start
sudo pm2 save
sudo pm2 startup
```

### Bước 5: Cấu hình Nginx

```bash
sudo nano /etc/nginx/sites-available/tempmail
```

Thêm:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/tempmail /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Bước 6: SSL với Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Bước 7: Cấu hình Cron cho Cleanup

```bash
crontab -e
```

Thêm:

```cron
0 * * * * cd /var/www/tempmail-app && /usr/bin/npm run cleanup >> /var/log/tempmail-cleanup.log 2>&1
```

## 📧 Cấu hình Email Provider

### Mailgun Setup

1. **Verify Domain:**
   - Thêm TXT records cho SPF, DKIM
   - Thêm MX records

2. **Create Route:**
   ```
   Priority: 0
   Filter Expression: match_recipient(".*@yourdomain.com")
   Actions: forward("https://yourdomain.com/api/webhooks/inbound-email")
   Description: TempMail Inbound
   ```

3. **Add Custom Header:**
   - Header: `X-Webhook-Token`
   - Value: Giá trị `INBOUND_WEBHOOK_SECRET`

### SendGrid Setup

1. **Authenticate Domain:**
   - Settings → Sender Authentication
   - Authenticate Domain
   - Follow DNS setup

2. **Inbound Parse:**
   - Settings → Inbound Parse
   - Add Host & URL
   - Hostname: `yourdomain.com`
   - URL: `https://yourdomain.com/api/webhooks/inbound-email`

3. **Security:**
   - Sử dụng IP whitelist hoặc
   - Verify SendGrid signature trong webhook handler

## 🔍 Monitoring

### PM2 Monitoring

```bash
# View logs
pm2 logs tempmail

# Monitor
pm2 monit

# Status
pm2 status
```

### Database Monitoring

```bash
# Check database size
sudo -u postgres psql -d tempmail -c "SELECT pg_size_pretty(pg_database_size('tempmail'));"

# Check table sizes
sudo -u postgres psql -d tempmail -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) FROM pg_tables WHERE schemaname = 'public';"
```

## 🔄 Updates

```bash
# Pull latest code
cd /var/www/tempmail-app
sudo git pull

# Install dependencies
sudo npm install

# Run migrations
sudo npx prisma migrate deploy

# Rebuild
sudo npm run build

# Restart
sudo pm2 restart tempmail
```

## 🆘 Troubleshooting

### Port already in use

```bash
# Find process
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

### Database connection issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Nginx issues

```bash
# Check config
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log

# Restart
sudo systemctl restart nginx
```
