# 🐳 Docker Deployment Guide

Hướng dẫn chạy TempMail app với Docker và Docker Compose.

## 📋 Yêu cầu

- Docker 20.10+
- Docker Compose 2.0+

## 🚀 Quick Start với Docker Compose

### 1. Clone project

```bash
git clone <repository-url>
cd tempmail-app
```

### 2. Cấu hình environment

Chỉnh sửa `docker-compose.yml`, thay đổi các giá trị:

```yaml
environment:
  TEMPMAIL_DOMAIN: yourdomain.com  # Thay bằng domain của bạn
  NEXT_PUBLIC_TEMPMAIL_DOMAIN: yourdomain.com
  INBOUND_WEBHOOK_SECRET: your-secure-random-string  # Tạo chuỗi ngẫu nhiên
```

### 3. Chạy

```bash
# Build và start
docker-compose up -d

# Xem logs
docker-compose logs -f

# Stop
docker-compose down

# Stop và xóa volumes
docker-compose down -v
```

Truy cập: http://localhost:3000

## 🔧 Build Docker Image riêng

### Build image

```bash
docker build -t tempmail-app .
```

### Run với PostgreSQL external

```bash
# Chạy PostgreSQL
docker run -d \
  --name tempmail-postgres \
  -e POSTGRES_USER=tempmail \
  -e POSTGRES_PASSWORD=secure_password \
  -e POSTGRES_DB=tempmail \
  -p 5432:5432 \
  postgres:16-alpine

# Chạy app
docker run -d \
  --name tempmail-app \
  --link tempmail-postgres:postgres \
  -e DATABASE_URL="postgresql://tempmail:secure_password@postgres:5432/tempmail" \
  -e TEMPMAIL_DOMAIN="example.com" \
  -e NEXT_PUBLIC_TEMPMAIL_DOMAIN="example.com" \
  -e MAILBOX_TTL_MINUTES="60" \
  -e INBOUND_WEBHOOK_SECRET="your-secret" \
  -p 3000:3000 \
  tempmail-app
```

## 🌐 Deploy với Docker trên VPS

### 1. Cài đặt Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin
```

### 2. Clone và setup

```bash
cd /opt
sudo git clone <repository-url> tempmail-app
cd tempmail-app
```

### 3. Tạo .env file

```bash
sudo nano .env
```

Thêm:

```env
POSTGRES_USER=tempmail
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=tempmail
DATABASE_URL=postgresql://tempmail:your-secure-password@postgres:5432/tempmail
TEMPMAIL_DOMAIN=yourdomain.com
NEXT_PUBLIC_TEMPMAIL_DOMAIN=yourdomain.com
MAILBOX_TTL_MINUTES=60
INBOUND_WEBHOOK_SECRET=your-secure-webhook-secret
```

### 4. Update docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: tempmail-db
    restart: unless-stopped
    env_file: .env
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - tempmail-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: tempmail-app
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    env_file: .env
    ports:
      - "3000:3000"
    networks:
      - tempmail-network
    command: >
      sh -c "
        npx prisma migrate deploy &&
        node server.js
      "

volumes:
  postgres_data:

networks:
  tempmail-network:
    driver: bridge
```

### 5. Start services

```bash
sudo docker-compose up -d
```

### 6. Cấu hình Nginx reverse proxy

```bash
sudo nano /etc/nginx/sites-available/tempmail
```

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

```bash
sudo ln -s /etc/nginx/sites-available/tempmail /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. SSL với Let's Encrypt

```bash
sudo certbot --nginx -d yourdomain.com
```

## 🔄 Cron Job cho Cleanup

### Option 1: Cron trong host

```bash
crontab -e
```

Thêm:

```cron
0 * * * * docker exec tempmail-app node /app/scripts/cleanup.js >> /var/log/tempmail-cleanup.log 2>&1
```

### Option 2: Thêm cleanup service vào docker-compose

```yaml
  cleanup:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: tempmail-cleanup
    restart: unless-stopped
    depends_on:
      - postgres
    env_file: .env
    networks:
      - tempmail-network
    command: >
      sh -c "
        while true; do
          sleep 3600;
          node /app/scripts/cleanup.js;
        done
      "
```

## 📊 Monitoring

### Xem logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 app
```

### Container stats

```bash
docker stats tempmail-app tempmail-db
```

### Database backup

```bash
# Backup
docker exec tempmail-db pg_dump -U tempmail tempmail > backup.sql

# Restore
docker exec -i tempmail-db psql -U tempmail tempmail < backup.sql
```

## 🔧 Maintenance

### Update application

```bash
cd /opt/tempmail-app
sudo git pull
sudo docker-compose build
sudo docker-compose up -d
```

### Restart services

```bash
# Restart all
sudo docker-compose restart

# Restart specific service
sudo docker-compose restart app
```

### View database

```bash
# Connect to PostgreSQL
docker exec -it tempmail-db psql -U tempmail -d tempmail

# Run queries
SELECT COUNT(*) FROM "Mailbox";
SELECT COUNT(*) FROM "Message";
```

### Clean up

```bash
# Remove stopped containers
docker-compose down

# Remove with volumes
docker-compose down -v

# Remove images
docker rmi tempmail-app

# Clean system
docker system prune -a
```

## 🐛 Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs app

# Check if port is in use
sudo lsof -i :3000

# Restart
docker-compose restart app
```

### Database connection issues

```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Check if database is ready
docker exec tempmail-db pg_isready -U tempmail

# Restart database
docker-compose restart postgres
```

### Migration issues

```bash
# Run migrations manually
docker exec tempmail-app npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
docker exec tempmail-app npx prisma migrate reset --force
```

### Out of disk space

```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a --volumes

# Check container sizes
docker ps -s
```

## 🔒 Security Best Practices

1. **Change default passwords** trong `.env`
2. **Use secrets management** cho production
3. **Limit container resources:**

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

4. **Use non-root user** (đã có trong Dockerfile)
5. **Regular updates:**

```bash
docker-compose pull
docker-compose up -d
```

## 📚 Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
