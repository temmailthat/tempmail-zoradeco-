# 📧 TempMail - Temporary Email Service

> Ứng dụng web tạo email tạm thời cho **zoradeco.com**

🌐 **Live:** https://tempmail.zoradeco.com

Ứng dụng web tạo email tạm thời (temporary email) được xây dựng với Next.js 14, TypeScript, Prisma và Tailwind CSS.

## 🚀 Tính năng

- ✉️ Tạo địa chỉ email tạm thời ngẫu nhiên
- 📬 Nhận email realtime (polling mỗi 10 giây)
- 👀 Xem nội dung email (HTML và Plain Text)
- ⏰ Tự động hết hạn sau thời gian cấu hình
- 💾 Lưu nhiều mailbox trong session
- 📋 Copy địa chỉ email dễ dàng
- 🔒 Bảo mật với webhook authentication
- 🎨 Giao diện đẹp, responsive với Tailwind CSS

## 📋 Yêu cầu hệ thống

- Node.js 18+ hoặc 20+
- npm hoặc pnpm
- SQLite (mặc định) hoặc PostgreSQL/MySQL

## 🛠️ Cài đặt

### 1. Clone project

```bash
git clone <repository-url>
cd tempmail-app
```

### 2. Cài đặt dependencies

Sử dụng npm:
```bash
npm install
```

Hoặc pnpm (khuyến nghị):
```bash
pnpm install
```

### 3. Cấu hình môi trường

Copy file `.env.example` thành `.env`:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:

```env
DATABASE_URL="file:./dev.db"
TEMPMAIL_DOMAIN="yourdomain.com"
MAILBOX_TTL_MINUTES="60"
INBOUND_WEBHOOK_SECRET="your-secure-random-string-change-this"
```

**Lưu ý:** Thay `yourdomain.com` bằng domain thực của bạn.

### 4. Khởi tạo database

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Chạy development server

```bash
npm run dev
```

Hoặc:

```bash
pnpm dev
```

Truy cập: http://localhost:3000

## 🗄️ Database

### SQLite (Mặc định)

Mặc định project sử dụng SQLite cho development. Database file sẽ được tạo tại `prisma/dev.db`.

### Chuyển sang PostgreSQL

1. Cài đặt PostgreSQL
2. Tạo database mới
3. Cập nhật `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

4. Cập nhật `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/tempmail?schema=public"
```

5. Chạy migration:

```bash
npx prisma migrate dev
```

### Chuyển sang MySQL

Tương tự PostgreSQL, thay `provider = "mysql"` và connection string phù hợp.

## 📧 Cấu hình Email Provider

Để nhận email thực, bạn cần cấu hình email provider như Mailgun, SendGrid, hoặc AWS SES.

### Option 1: Mailgun

#### Bước 1: Đăng ký Mailgun

1. Truy cập https://www.mailgun.com/
2. Đăng ký tài khoản và verify domain của bạn
3. Cấu hình DNS records (MX, TXT) theo hướng dẫn của Mailgun

#### Bước 2: Tạo Route

1. Vào **Sending** → **Routes**
2. Tạo route mới:
   - **Expression Type:** Match Recipient
   - **Recipient:** `.*@yourdomain.com` (catch-all)
   - **Actions:** Forward → `https://your-app-domain.com/api/webhooks/inbound-email`
   - **Priority:** 0

#### Bước 3: Thêm Webhook Authentication

Trong phần **Actions**, thêm custom header:
- Header: `X-Webhook-Token`
- Value: Giá trị của `INBOUND_WEBHOOK_SECRET` trong `.env`

### Option 2: SendGrid

#### Bước 1: Đăng ký SendGrid

1. Truy cập https://sendgrid.com/
2. Đăng ký và verify domain

#### Bước 2: Cấu hình Inbound Parse

1. Vào **Settings** → **Inbound Parse**
2. Thêm hostname: `yourdomain.com`
3. Destination URL: `https://your-app-domain.com/api/webhooks/inbound-email`
4. Check "POST the raw, full MIME message"

#### Bước 3: Authentication

SendGrid không hỗ trợ custom headers cho inbound parse. Bạn có thể:
- Sử dụng IP whitelist
- Hoặc modify webhook handler để check SendGrid signature

### Option 3: AWS SES

1. Verify domain trong AWS SES
2. Tạo Receipt Rule Set
3. Thêm rule với action: SNS hoặc Lambda
4. Lambda function forward đến webhook endpoint

## 🔄 Cleanup Job

### Chạy manual

```bash
npm run cleanup
```

Hoặc:

```bash
pnpm cleanup
```

### Tự động với Cron (Linux/Mac)

Mở crontab:

```bash
crontab -e
```

Thêm dòng sau để chạy mỗi giờ:

```cron
0 * * * * cd /path/to/tempmail-app && npm run cleanup >> /var/log/tempmail-cleanup.log 2>&1
```

### Tự động với Task Scheduler (Windows)

1. Mở Task Scheduler
2. Tạo Basic Task
3. Trigger: Daily, repeat every 1 hour
4. Action: Start a program
   - Program: `cmd.exe`
   - Arguments: `/c cd /d C:\path\to\tempmail-app && npm run cleanup`

### Sử dụng API endpoint

Gọi endpoint cleanup:

```bash
curl -X POST http://localhost:3000/api/internal/cleanup-expired \
  -H "Authorization: Bearer your-internal-secret"
```

**Lưu ý:** Thêm `INTERNAL_API_SECRET` vào `.env` để bảo mật endpoint này.

## 🚀 Deploy lên Production

### Vercel (Khuyến nghị)

1. Push code lên GitHub
2. Import project vào Vercel
3. Cấu hình Environment Variables:
   - `DATABASE_URL`
   - `TEMPMAIL_DOMAIN`
   - `MAILBOX_TTL_MINUTES`
   - `INBOUND_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_TEMPMAIL_DOMAIN` (giống `TEMPMAIL_DOMAIN`)

4. Deploy

**Lưu ý:** Vercel không hỗ trợ SQLite trong production. Sử dụng PostgreSQL (Vercel Postgres, Supabase, Neon, etc.)

### Railway

1. Tạo project mới trên Railway
2. Connect GitHub repository
3. Thêm PostgreSQL service
4. Cấu hình environment variables
5. Deploy

### Render

1. Tạo Web Service mới
2. Connect repository
3. Build Command: `npm install && npx prisma generate && npm run build`
4. Start Command: `npm start`
5. Thêm PostgreSQL database
6. Cấu hình environment variables

### VPS/Server riêng

```bash
# Clone và cài đặt
git clone <repo>
cd tempmail-app
npm install
npx prisma generate

# Build
npm run build

# Chạy với PM2
npm install -g pm2
pm2 start npm --name "tempmail" -- start
pm2 save
pm2 startup
```

## 📁 Cấu trúc Project

```
tempmail-app/
├── app/
│   ├── api/
│   │   ├── mailboxes/
│   │   │   ├── [id]/
│   │   │   │   └── messages/
│   │   │   │       └── route.ts
│   │   │   └── route.ts
│   │   ├── messages/
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── webhooks/
│   │   │   └── inbound-email/
│   │   │       └── route.ts
│   │   └── internal/
│   │       └── cleanup-expired/
│   │           └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Sidebar.tsx
│   ├── MailboxList.tsx
│   └── MessageViewer.tsx
├── lib/
│   ├── prisma.ts
│   └── utils.ts
├── prisma/
│   └── schema.prisma
├── scripts/
│   └── cleanup.ts
├── types/
│   └── index.ts
├── .env.example
├── .gitignore
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🔧 API Endpoints

### POST /api/mailboxes
Tạo mailbox mới

**Response:**
```json
{
  "id": "clxxx...",
  "addressLocal": "abc123",
  "addressFull": "abc123@example.com",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "expiresAt": "2024-01-01T01:00:00.000Z"
}
```

### GET /api/mailboxes/[id]/messages
Lấy danh sách email của mailbox

**Response:**
```json
[
  {
    "id": "clxxx...",
    "fromEmail": "sender@example.com",
    "fromName": "Sender Name",
    "subject": "Test Email",
    "createdAt": "2024-01-01T00:30:00.000Z"
  }
]
```

### GET /api/messages/[id]
Lấy chi tiết một email

**Response:**
```json
{
  "id": "clxxx...",
  "fromEmail": "sender@example.com",
  "fromName": "Sender Name",
  "subject": "Test Email",
  "bodyText": "Plain text content",
  "bodyHtml": "<html>...</html>",
  "createdAt": "2024-01-01T00:30:00.000Z"
}
```

### POST /api/webhooks/inbound-email
Webhook endpoint cho email provider

**Headers:**
- `X-Webhook-Token`: Secret token

**Body:** Depends on email provider format

### POST /api/internal/cleanup-expired
Xóa mailbox hết hạn

**Headers:**
- `Authorization`: Bearer token (optional)

## 🔒 Bảo mật

- Webhook endpoint yêu cầu secret token
- HTML email được sanitize trước khi render
- Mailbox ID không thể đoán được (CUID)
- Không có API liệt kê tất cả mailboxes
- Tự động xóa dữ liệu hết hạn

## 🐛 Troubleshooting

### Không nhận được email

1. Kiểm tra DNS records (MX, SPF, DKIM)
2. Verify webhook URL accessible từ internet
3. Check logs của email provider
4. Verify `INBOUND_WEBHOOK_SECRET` khớp
5. Test webhook với curl:

```bash
curl -X POST http://localhost:3000/api/webhooks/inbound-email \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Token: your-secret" \
  -d '{
    "recipient": "test@yourdomain.com",
    "sender": "sender@example.com",
    "subject": "Test",
    "body-plain": "Test message"
  }'
```

### Database errors

```bash
# Reset database
rm prisma/dev.db
npx prisma migrate reset
```

### Build errors

```bash
# Clear cache
rm -rf .next
npm run build
```

## 📝 License

MIT

## 🤝 Contributing

Pull requests are welcome!

## 📧 Support

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub.
