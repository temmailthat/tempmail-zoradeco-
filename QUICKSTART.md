# 🚀 Quick Start Guide

Hướng dẫn nhanh để chạy TempMail app trong 5 phút.

## ⚡ Cài đặt nhanh

```bash
# 1. Clone project (hoặc giải nén)
cd tempmail-app

# 2. Cài đặt dependencies
npm install
# hoặc
pnpm install

# 3. Copy file môi trường
cp .env.example .env

# 4. Chỉnh sửa .env (quan trọng!)
# Mở file .env và thay đổi:
# - TEMPMAIL_DOMAIN thành domain của bạn
# - INBOUND_WEBHOOK_SECRET thành một chuỗi ngẫu nhiên bảo mật

# 5. Khởi tạo database
npx prisma generate
npx prisma migrate dev --name init

# 6. Chạy development server
npm run dev
```

Truy cập: http://localhost:3000

## 🎯 Test nhanh

### 1. Tạo mailbox

Mở trình duyệt, truy cập http://localhost:3000 và click nút "Tạo".

### 2. Test webhook (không cần email provider)

Mở terminal mới và chạy:

```bash
# Lấy địa chỉ email vừa tạo (ví dụ: abc123@example.com)
# Thay abc123 bằng local part của email bạn vừa tạo

curl -X POST http://localhost:3000/api/webhooks/inbound-email \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Token: change-this-to-secure-random-string" \
  -d '{
    "recipient": "abc123@example.com",
    "sender": "test@example.com",
    "from": "Test Sender <test@example.com>",
    "subject": "Test Email",
    "body-plain": "This is a test email from curl",
    "body-html": "<p>This is a <strong>test email</strong> from curl</p>"
  }'
```

Email sẽ xuất hiện trong UI sau vài giây!

## 📝 Checklist

- [ ] Node.js 18+ đã cài đặt
- [ ] npm hoặc pnpm đã cài đặt
- [ ] Dependencies đã cài (`npm install`)
- [ ] File `.env` đã tạo và cấu hình
- [ ] Database đã migrate (`npx prisma migrate dev`)
- [ ] Server đang chạy (`npm run dev`)
- [ ] Có thể tạo mailbox trên UI
- [ ] Test webhook thành công

## 🔧 Commands hữu ích

```bash
# Xem database với Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset

# Chạy cleanup manual
npm run cleanup

# Build production
npm run build

# Start production
npm start
```

## 🐛 Lỗi thường gặp

### Port 3000 đã được sử dụng

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Prisma errors

```bash
# Xóa và tạo lại database
rm prisma/dev.db
npx prisma migrate dev
```

### Module not found

```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

## 📚 Đọc thêm

- [README.md](README.md) - Hướng dẫn đầy đủ
- [DEPLOYMENT.md](DEPLOYMENT.md) - Hướng dẫn deploy
- [WEBHOOK_EXAMPLES.md](WEBHOOK_EXAMPLES.md) - Ví dụ webhook

## 🆘 Cần trợ giúp?

1. Kiểm tra logs trong terminal
2. Mở DevTools (F12) trong browser
3. Kiểm tra file `.env` đã đúng chưa
4. Đọc phần Troubleshooting trong README.md

## 🎉 Tiếp theo

Sau khi test thành công local:

1. Đọc [DEPLOYMENT.md](DEPLOYMENT.md) để deploy lên production
2. Cấu hình email provider (Mailgun/SendGrid)
3. Setup domain và DNS records
4. Cấu hình cron job cho cleanup

Chúc bạn thành công! 🚀
