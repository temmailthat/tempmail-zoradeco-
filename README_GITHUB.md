# 📧 TempMail - Temporary Email Service

Dịch vụ email tạm thời cho **zoradeco.com**

🌐 **Live Demo:** https://tempmail.zoradeco.com

## ✨ Features

- 📬 Tạo email tạm thời ngẫu nhiên
- ⚡ Nhận email realtime
- 👀 Xem HTML & Plain Text
- ⏰ Tự động hết hạn sau 60 phút
- 🔒 Bảo mật với webhook authentication
- 📱 Responsive design

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Prisma + PostgreSQL
- **Deployment:** Vercel
- **Email:** Mailgun

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Setup database
npx prisma generate
npx prisma migrate dev

# Run development server
npm run dev
```

Open http://localhost:3000

## 📚 Documentation

- [Full Documentation](README.md)
- [Deployment Guide](DEPLOY_VERCEL_MAILGUN.md)
- [Quick Start](QUICKSTART.md)
- [Testing Guide](TESTING.md)

## 📝 License

MIT
