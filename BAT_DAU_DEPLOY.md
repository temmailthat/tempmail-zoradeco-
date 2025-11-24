# 🚀 BẮT ĐẦU DEPLOY - CHECKLIST NHANH

## ✅ Bước 1: Push lên GitHub (5 phút)

### Chuẩn bị:
- [ ] Có tài khoản GitHub (nếu chưa: https://github.com/signup)
- [ ] Đã cài Git trên máy

### Làm:

1. **Tạo repo mới trên GitHub:**
   - Vào: https://github.com/new
   - Tên: `tempmail-zoradeco`
   - Chọn Private
   - KHÔNG check "Add README"
   - Click "Create repository"

2. **Mở terminal trong thư mục project này và chạy:**

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tempmail-zoradeco.git
git push -u origin main
```

**⚠️ Thay YOUR_USERNAME bằng username GitHub của bạn!**

---

## ✅ Bước 2: Deploy lên Vercel (10 phút)

### Chuẩn bị:
- [ ] Tài khoản Vercel (sign up bằng GitHub tại: https://vercel.com)

### Làm:

1. **Tạo Database:**
   - Vào: https://vercel.com/dashboard
   - Click "Storage" (menu trái)
   - Click "Create Database"
   - Chọn "Postgres"
   - Tên: `tempmail-db`
   - Region: Singapore
   - Click "Create"
   - **LƯU LẠI** connection string (DATABASE_URL)

2. **Import Project:**
   - Vào: https://vercel.com/new
   - Click "Import Git Repository"
   - Chọn repo `tempmail-zoradeco`
   - Click "Import"

3. **Configure:**
   - Build Command: `prisma generate && next build`
   - Add Environment Variables:

```
DATABASE_URL=postgresql://... (paste từ bước 1)
TEMPMAIL_DOMAIN=zoradeco.com
NEXT_PUBLIC_TEMPMAIL_DOMAIN=zoradeco.com
MAILBOX_TTL_MINUTES=60
INBOUND_WEBHOOK_SECRET=zoradeco-webhook-secret-2024-abc123xyz
```

   - Click "Deploy"
   - Đợi 2-3 phút

4. **Run Migration:**

Mở terminal và chạy:

```bash
# Windows PowerShell:
$env:DATABASE_URL="postgresql://..." # paste connection string
npx prisma migrate deploy

# Mac/Linux:
export DATABASE_URL="postgresql://..."
npx prisma migrate deploy
```

**✅ App đã live tại: https://tempmail-zoradeco.vercel.app**

---

## ✅ Bước 3: Setup Domain (5 phút)

### Trong Vercel:

1. Dashboard → Settings → Domains
2. Add domain: `tempmail.zoradeco.com`
3. Vercel sẽ hiển thị:
   ```
   Type: CNAME
   Name: tempmail
   Value: cname.vercel-dns.com
   ```

### Trong cPanel:

1. Login cPanel của zoradeco.com
2. Tìm "Zone Editor"
3. Click "Manage" bên cạnh zoradeco.com
4. Add Record:
   - Type: CNAME
   - Name: tempmail
   - Record: cname.vercel-dns.com
   - TTL: 14400
5. Save

**Đợi 5-10 phút để DNS propagate**

**✅ App giờ truy cập tại: https://tempmail.zoradeco.com**

---

## ✅ Bước 4: Setup Mailgun (15 phút)

### Đăng ký:

1. Vào: https://signup.mailgun.com/new/signup
2. Sign up (FREE plan)
3. Verify email

### Add Domain:

1. Sending → Domains → Add New Domain
2. Domain: `zoradeco.com`
3. Region: US
4. Add Domain

### Add DNS Records trong cPanel:

Mailgun sẽ cho bạn các records, add vào cPanel Zone Editor:

**MX Records:**
```
Type: MX, Priority: 10, Value: mxa.mailgun.org
Type: MX, Priority: 10, Value: mxb.mailgun.org
```

**TXT Records:**
```
Type: TXT, Name: @, Value: v=spf1 include:mailgun.org ~all
Type: TXT, Name: smtp._domainkey, Value: (Mailgun cung cấp - copy paste)
```

**CNAME Record:**
```
Type: CNAME, Name: email, Value: mailgun.org
```

### Verify Domain:

1. Quay lại Mailgun
2. Click "Verify DNS Settings"
3. Đợi 5-10 phút
4. Refresh và verify lại
5. Đợi đến khi thấy ✅ "Domain verified"

### Tạo Route:

1. Sending → Routes → Create Route
2. Configure:
   - Priority: 0
   - Expression Type: Match Recipient
   - Recipient: `.*@zoradeco.com`
   - Actions: Forward
   - URL: `https://tempmail.zoradeco.com/api/webhooks/inbound-email`
3. Create Route

---

## ✅ Bước 5: TEST (5 phút)

### Test 1: Tạo Mailbox

1. Vào: https://tempmail.zoradeco.com
2. Click "Tạo"
3. Xem email: `abc123@zoradeco.com` ✅

### Test 2: Gửi Email Thật

1. Từ Gmail của bạn
2. Gửi email đến: `abc123@zoradeco.com`
3. Subject: "Test"
4. Body: "Hello!"

### Test 3: Nhận Email

1. Quay lại app
2. Đợi 10-20 giây
3. Email xuất hiện ✅

---

## 🎉 XONG!

Bạn đã có TempMail hoạt động tại:
- **Website:** https://tempmail.zoradeco.com
- **Email:** *@zoradeco.com

---

## 🆘 Gặp vấn đề?

Đọc file: **DEPLOY_VERCEL_MAILGUN.md** (hướng dẫn chi tiết)

Hoặc check:
- Vercel Logs: Dashboard → Deployments → View Logs
- Mailgun Logs: Dashboard → Logs
- DNS: https://dnschecker.org

---

## 📞 Cần giúp đỡ?

Hỏi tôi bất cứ lúc nào! 😊
