# 🚀 Hướng dẫn Deploy: Vercel + Mailgun cho zoradeco.com

## 📋 Checklist Chuẩn bị

- [ ] Tài khoản GitHub
- [ ] Tài khoản Vercel (sign up bằng GitHub)
- [ ] Tài khoản Mailgun (free tier)
- [ ] Quyền truy cập cPanel của zoradeco.com

---

## PHẦN 1: PUSH CODE LÊN GITHUB (5 phút)

### Bước 1: Tạo GitHub Repository

1. Vào https://github.com/new
2. Repository name: `tempmail-zoradeco`
3. Description: `Temporary Email Service for zoradeco.com`
4. Chọn **Private** (hoặc Public tùy bạn)
5. **KHÔNG** check "Add README" (vì đã có rồi)
6. Click **Create repository**

### Bước 2: Push Code

Mở terminal trong thư mục project và chạy:

```bash
# Khởi tạo git (nếu chưa có)
git init

# Add tất cả files
git add .

# Commit
git commit -m "Initial commit - TempMail for zoradeco.com"

# Đổi branch thành main
git branch -M main

# Add remote (THAY your-username bằng username GitHub của bạn)
git remote add origin https://github.com/your-username/tempmail-zoradeco.git

# Push
git push -u origin main
```

**✅ Xong! Code đã lên GitHub**

---

## PHẦN 2: DEPLOY LÊN VERCEL (10 phút)

### Bước 1: Tạo Database (Vercel Postgres)

1. Vào https://vercel.com
2. Click **Sign Up** → Chọn **Continue with GitHub**
3. Authorize Vercel
4. Vào **Storage** tab (menu bên trái)
5. Click **Create Database**
6. Chọn **Postgres**
7. Database name: `tempmail-db`
8. Region: Chọn gần Việt Nam nhất (Singapore hoặc Hong Kong)
9. Click **Create**
10. **Copy connection string** (DATABASE_URL) - Lưu lại!

### Bước 2: Import Project từ GitHub

1. Vào https://vercel.com/new
2. Click **Import Git Repository**
3. Tìm repo `tempmail-zoradeco`
4. Click **Import**

### Bước 3: Configure Project

**Framework Preset:** Next.js (tự động detect)

**Root Directory:** `./` (giữ nguyên)

**Build Command:** `prisma generate && next build` (quan trọng!)

**Environment Variables:** Click **Add** và thêm:

```env
DATABASE_URL=postgresql://... (paste từ Vercel Postgres)
TEMPMAIL_DOMAIN=zoradeco.com
NEXT_PUBLIC_TEMPMAIL_DOMAIN=zoradeco.com
MAILBOX_TTL_MINUTES=60
INBOUND_WEBHOOK_SECRET=zoradeco-secure-webhook-secret-2024-change-this
```

**⚠️ Quan trọng:** 
- `INBOUND_WEBHOOK_SECRET` phải là chuỗi ngẫu nhiên, khó đoán
- Lưu lại secret này, sẽ dùng ở bước sau!

### Bước 4: Deploy

1. Click **Deploy**
2. Đợi 2-3 phút
3. Khi thấy 🎉 **Congratulations!** → Click **Continue to Dashboard**
4. Click **Visit** để xem app

**✅ App đã live tại:** `https://tempmail-zoradeco.vercel.app`

### Bước 5: Run Database Migration

1. Trong Vercel Dashboard → **Settings** → **Environment Variables**
2. Copy `DATABASE_URL`
3. Mở terminal local, chạy:

```bash
# Set DATABASE_URL tạm thời
$env:DATABASE_URL="postgresql://..." # Windows PowerShell
# hoặc
export DATABASE_URL="postgresql://..." # Mac/Linux

# Run migration
npx prisma migrate deploy
```

**Hoặc dùng Vercel CLI:**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Run migration
vercel env pull .env.production
npx prisma migrate deploy
```

---

## PHẦN 3: CÀI ĐẶT CUSTOM DOMAIN (5 phút)

### Bước 1: Add Domain trong Vercel

1. Trong Vercel Dashboard → **Settings** → **Domains**
2. Click **Add**
3. Nhập: `tempmail.zoradeco.com`
4. Click **Add**

Vercel sẽ hiển thị:
```
Type: CNAME
Name: tempmail
Value: cname.vercel-dns.com
```

### Bước 2: Cấu hình DNS trong cPanel

1. **Login cPanel** của zoradeco.com
2. Tìm **Zone Editor** (hoặc **Advanced DNS Zone Editor**)
3. Click **Manage** bên cạnh zoradeco.com
4. Click **Add Record**

**Thêm CNAME record:**
```
Name: tempmail
Type: CNAME
Record: cname.vercel-dns.com
TTL: 14400 (hoặc Auto)
```

5. Click **Save**

### Bước 3: Verify Domain

1. Quay lại Vercel Dashboard
2. Đợi 1-2 phút
3. Refresh page
4. Khi thấy ✅ **Valid Configuration** → Xong!

**✅ App giờ truy cập được tại:** `https://tempmail.zoradeco.com`

---

## PHẦN 4: SETUP MAILGUN (15 phút)

### Bước 1: Đăng ký Mailgun

1. Vào https://signup.mailgun.com/new/signup
2. Sign up (FREE plan - 5,000 emails/tháng)
3. Verify email
4. Complete profile

### Bước 2: Add Domain

1. Vào **Sending** → **Domains**
2. Click **Add New Domain**
3. Domain Name: `zoradeco.com`
4. Region: US (hoặc EU tùy bạn)
5. Click **Add Domain**

### Bước 3: Verify Domain (DNS Records)

Mailgun sẽ cho bạn các DNS records cần add:

#### 3.1. TXT Records (SPF)
```
Type: TXT
Name: @
Value: v=spf1 include:mailgun.org ~all
TTL: 14400
```

#### 3.2. TXT Records (DKIM)
```
Type: TXT
Name: smtp._domainkey
Value: k=rsa; p=MIGfMA0GCSq... (Mailgun cung cấp)
TTL: 14400
```

#### 3.3. CNAME Record (Tracking)
```
Type: CNAME
Name: email
Value: mailgun.org
TTL: 14400
```

#### 3.4. MX Records
```
Type: MX
Name: @
Priority: 10
Value: mxa.mailgun.org
TTL: 14400

Type: MX
Name: @
Priority: 10
Value: mxb.mailgun.org
TTL: 14400
```

**Cách add trong cPanel:**

1. **cPanel** → **Zone Editor**
2. Click **Manage** bên cạnh zoradeco.com
3. Add từng record một theo bảng trên
4. Click **Save** sau mỗi record

### Bước 4: Verify trong Mailgun

1. Quay lại Mailgun Dashboard
2. Click **Verify DNS Settings**
3. Đợi 5-10 phút (DNS propagation)
4. Refresh và click **Verify** lại
5. Khi thấy ✅ **Domain verified** → Xong!

### Bước 5: Tạo Route (Webhook)

1. Vào **Sending** → **Routes**
2. Click **Create Route**

**Configure Route:**

```
Priority: 0
Expression Type: Match Recipient
Recipient: .*@zoradeco.com
Description: TempMail Inbound Handler

Actions:
☑ Forward
URL: https://tempmail.zoradeco.com/api/webhooks/inbound-email
```

3. Click **Create Route**

### Bước 6: Add Webhook Authentication

Mailgun không hỗ trợ custom headers trong Routes, nên cần dùng cách khác:

**Option A: Verify Mailgun Signature (Khuyến nghị)**

Lấy API Key từ Mailgun:
1. **Settings** → **API Keys**
2. Copy **Private API key**
3. Add vào Vercel Environment Variables:
```
MAILGUN_API_KEY=key-xxxxxxxxxxxxx
```

**Option B: IP Whitelist**

Whitelist Mailgun IPs trong webhook handler.

---

## PHẦN 5: TEST TOÀN BỘ HỆ THỐNG (5 phút)

### Test 1: Tạo Mailbox

1. Vào https://tempmail.zoradeco.com
2. Click nút **"Tạo"**
3. Kiểm tra email hiển thị: `abc123@zoradeco.com` ✅

### Test 2: Gửi Email Thật

1. Từ Gmail/email cá nhân của bạn
2. Gửi email đến địa chỉ vừa tạo: `abc123@zoradeco.com`
3. Subject: "Test TempMail"
4. Body: "Hello from real email!"
5. Gửi

### Test 3: Kiểm tra Nhận Email

1. Quay lại https://tempmail.zoradeco.com
2. Đợi 10-20 giây (polling)
3. Email sẽ xuất hiện trong list ✅
4. Click vào email để xem chi tiết ✅

---

## 🎉 HOÀN THÀNH!

Bây giờ bạn đã có:

✅ TempMail app chạy tại: `https://tempmail.zoradeco.com`
✅ Nhận email thật tại: `*@zoradeco.com`
✅ Tự động cleanup sau 60 phút
✅ SSL/HTTPS miễn phí
✅ Global CDN
✅ Không tốn tiền!

---

## 🔧 Maintenance

### Update Code

```bash
# Local: Sửa code
git add .
git commit -m "Update feature"
git push

# Vercel tự động deploy!
```

### Xem Logs

1. Vercel Dashboard → **Deployments**
2. Click deployment → **View Function Logs**

### Monitor Email

1. Mailgun Dashboard → **Logs**
2. Xem tất cả emails đã nhận

### Database Management

```bash
# Xem database
npx prisma studio

# Với production database
DATABASE_URL="postgresql://..." npx prisma studio
```

---

## 🐛 Troubleshooting

### Email không nhận được

1. **Check Mailgun Logs:**
   - Mailgun Dashboard → Logs
   - Xem có email đến không?

2. **Check Vercel Logs:**
   - Vercel Dashboard → Functions
   - Xem webhook có được gọi không?

3. **Check DNS:**
   - https://mxtoolbox.com/SuperTool.aspx
   - Nhập: zoradeco.com
   - Verify MX records đúng

4. **Check Webhook Secret:**
   - Verify `INBOUND_WEBHOOK_SECRET` trong Vercel
   - Phải khớp với secret trong Mailgun route

### App không load

1. **Check Vercel Deployment:**
   - Dashboard → Deployments
   - Xem có lỗi build không?

2. **Check Environment Variables:**
   - Settings → Environment Variables
   - Verify tất cả variables đã set

3. **Check Database:**
   - Verify migration đã chạy
   - Test connection string

### Domain không hoạt động

1. **Check DNS Propagation:**
   - https://dnschecker.org
   - Nhập: tempmail.zoradeco.com
   - Đợi DNS propagate (có thể mất 24h)

2. **Check CNAME:**
   - Verify CNAME record trong cPanel
   - Phải trỏ đến: cname.vercel-dns.com

---

## 📞 Support

- **Vercel Docs:** https://vercel.com/docs
- **Mailgun Docs:** https://documentation.mailgun.com
- **Prisma Docs:** https://www.prisma.io/docs

---

## 🎯 Next Steps

1. **Custom branding:** Sửa logo, màu sắc trong code
2. **Analytics:** Add Google Analytics
3. **Rate limiting:** Giới hạn số mailbox/IP
4. **Attachments:** Hỗ trợ file đính kèm
5. **Multiple domains:** Hỗ trợ nhiều domain

Chúc bạn thành công! 🚀
