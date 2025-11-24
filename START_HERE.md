# 🎯 START HERE - TempMail Project

Chào mừng đến với TempMail - Temporary Email Service!

## 📚 Tài liệu hướng dẫn

Project này có đầy đủ tài liệu cho mọi nhu cầu:

### 🚀 Bắt đầu nhanh
- **[QUICKSTART.md](QUICKSTART.md)** - Chạy project trong 5 phút
  - Cài đặt dependencies
  - Setup database
  - Chạy dev server
  - Test với curl

### 📖 Tài liệu chính
- **[README.md](README.md)** - Hướng dẫn đầy đủ và chi tiết
  - Tổng quan tính năng
  - Cài đặt từng bước
  - Cấu hình database
  - Cấu hình email provider
  - Cleanup jobs
  - Troubleshooting

### 🚢 Deploy Production
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Hướng dẫn deploy chi tiết
  - Deploy lên Vercel
  - Deploy lên Railway
  - Deploy lên Render
  - Deploy lên VPS (Ubuntu)
  - Cấu hình Nginx + SSL
  - Monitoring

### 🐳 Docker
- **[DOCKER.md](DOCKER.md)** - Containerization
  - Docker Compose setup
  - Build Docker image
  - Deploy với Docker trên VPS
  - Cron jobs trong Docker
  - Monitoring và maintenance

### 📧 Email Provider
- **[WEBHOOK_EXAMPLES.md](WEBHOOK_EXAMPLES.md)** - Webhook integration
  - Mailgun format
  - SendGrid format
  - AWS SES format
  - Testing webhooks locally
  - Security verification

### 🧪 Testing
- **[TESTING.md](TESTING.md)** - Comprehensive testing guide
  - Manual testing steps
  - API testing
  - Security testing
  - Performance testing
  - Pre-deployment checklist

### 📁 Project Structure
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Cấu trúc chi tiết
  - Directory tree
  - File descriptions
  - Data flow
  - Database schema
  - Dependencies

## 🎯 Lộ trình sử dụng

### 1️⃣ Lần đầu sử dụng (Development)

```bash
# Đọc QUICKSTART.md và làm theo
1. npm install
2. cp .env.example .env
3. Chỉnh sửa .env
4. npx prisma migrate dev
5. npm run dev
6. Test với curl
```

### 2️⃣ Hiểu rõ project

```bash
# Đọc các file theo thứ tự:
1. README.md - Hiểu tổng quan
2. PROJECT_STRUCTURE.md - Hiểu cấu trúc
3. WEBHOOK_EXAMPLES.md - Hiểu webhook
```

### 3️⃣ Testing

```bash
# Đọc TESTING.md và test đầy đủ
1. Manual testing
2. API testing
3. Security testing
4. UI/UX testing
```

### 4️⃣ Deploy Production

```bash
# Chọn platform và đọc hướng dẫn:
- Vercel: DEPLOYMENT.md (section Vercel)
- Docker: DOCKER.md
- VPS: DEPLOYMENT.md (section VPS)
```

### 5️⃣ Cấu hình Email

```bash
# Đọc README.md và WEBHOOK_EXAMPLES.md
1. Chọn provider (Mailgun/SendGrid/SES)
2. Verify domain
3. Setup webhook
4. Test nhận email thật
```

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Prisma + SQLite/PostgreSQL
- **Icons:** Lucide React
- **Date:** date-fns
- **Security:** DOMPurify

## 📦 Project Files

```
tempmail-app/
├── 📱 Frontend
│   ├── app/page.tsx              # Main page
│   ├── components/               # React components
│   └── app/globals.css           # Styles
│
├── 🔌 Backend API
│   ├── app/api/mailboxes/        # Mailbox CRUD
│   ├── app/api/messages/         # Message retrieval
│   ├── app/api/webhooks/         # Email receiving
│   └── app/api/internal/         # Cleanup
│
├── 🗄️ Database
│   ├── prisma/schema.prisma      # Schema
│   └── lib/prisma.ts             # Client
│
├── 🔧 Configuration
│   ├── .env.example              # Environment template
│   ├── next.config.mjs           # Next.js config
│   ├── tailwind.config.ts        # Tailwind config
│   └── tsconfig.json             # TypeScript config
│
├── 🐳 Docker
│   ├── Dockerfile                # Image definition
│   ├── docker-compose.yml        # Compose config
│   └── .dockerignore             # Ignore rules
│
└── 📚 Documentation
    ├── README.md                 # Main docs
    ├── QUICKSTART.md             # Quick start
    ├── DEPLOYMENT.md             # Deploy guide
    ├── DOCKER.md                 # Docker guide
    ├── TESTING.md                # Testing guide
    ├── WEBHOOK_EXAMPLES.md       # Webhook examples
    ├── PROJECT_STRUCTURE.md      # Structure docs
    └── START_HERE.md             # This file
```

## ⚡ Quick Commands

```bash
# Development
npm install              # Install dependencies
npm run dev             # Start dev server
npx prisma studio       # Open database GUI

# Database
npx prisma generate     # Generate Prisma client
npx prisma migrate dev  # Run migrations
npx prisma migrate reset # Reset database

# Production
npm run build           # Build for production
npm start               # Start production server
npm run cleanup         # Run cleanup script

# Docker
docker-compose up -d    # Start with Docker
docker-compose logs -f  # View logs
docker-compose down     # Stop containers
```

## 🎨 Features

✅ **Tạo email tạm thời** - Random địa chỉ email
✅ **Nhận email realtime** - Polling mỗi 10 giây
✅ **Xem nội dung** - HTML và Plain Text
✅ **Tự động hết hạn** - Configurable TTL
✅ **Nhiều mailbox** - Lưu trong session
✅ **Copy dễ dàng** - One-click copy
✅ **Bảo mật** - Webhook auth, HTML sanitization
✅ **Responsive** - Mobile-friendly UI
✅ **Production-ready** - Docker, deployment guides

## 🔐 Security

- ✅ Webhook authentication với secret token
- ✅ HTML sanitization với DOMPurify
- ✅ SQL injection protection với Prisma
- ✅ CUID prevents ID guessing
- ✅ Automatic data cleanup
- ✅ No public mailbox listing

## 🌟 Highlights

### Clean Architecture
- Separation of concerns
- Type-safe với TypeScript
- Reusable components
- Clear data flow

### Developer Experience
- Hot reload
- Prisma Studio
- Comprehensive docs
- Easy testing

### Production Ready
- Docker support
- Multiple deployment options
- Monitoring guides
- Security best practices

## 📞 Support

### Gặp vấn đề?

1. **Đọc Troubleshooting** trong README.md
2. **Check logs** trong terminal và browser console
3. **Verify .env** file đã đúng chưa
4. **Test từng bước** theo TESTING.md

### Common Issues

| Issue | Solution |
|-------|----------|
| Port 3000 in use | Kill process hoặc đổi port |
| Database error | Run `npx prisma migrate reset` |
| Module not found | Delete node_modules, `npm install` |
| Webhook not working | Check secret token, verify URL |
| Email not appearing | Check polling, verify mailbox not expired |

## 🎓 Learning Resources

### Next.js
- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)

### Prisma
- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

### Tailwind CSS
- [Tailwind Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/)

## 🚀 Next Steps

### Sau khi setup thành công:

1. ✅ **Test local** - Verify mọi thứ hoạt động
2. ✅ **Choose deployment** - Chọn platform (Vercel/Docker/VPS)
3. ✅ **Setup email provider** - Mailgun/SendGrid/SES
4. ✅ **Configure domain** - DNS, MX records
5. ✅ **Deploy** - Follow deployment guide
6. ✅ **Test production** - Verify nhận email thật
7. ✅ **Setup monitoring** - Logs, uptime, errors
8. ✅ **Setup cron** - Cleanup job

## 🎉 Kết luận

Project này cung cấp:

- ✅ **Full source code** - Production-ready
- ✅ **Complete documentation** - Từ A-Z
- ✅ **Multiple deployment options** - Flexible
- ✅ **Security best practices** - Safe
- ✅ **Testing guides** - Comprehensive
- ✅ **Docker support** - Easy deployment

**Chúc bạn thành công với TempMail project! 🚀**

---

💡 **Tip:** Bắt đầu với [QUICKSTART.md](QUICKSTART.md) để chạy project trong 5 phút!
