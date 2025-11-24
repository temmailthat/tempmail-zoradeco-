# 🧪 Testing Guide

Hướng dẫn test TempMail app trước khi deploy production.

## ✅ Pre-deployment Checklist

### 1. Environment Setup
- [ ] `.env` file đã được tạo và cấu hình đúng
- [ ] `DATABASE_URL` đã được set
- [ ] `TEMPMAIL_DOMAIN` đã được set
- [ ] `INBOUND_WEBHOOK_SECRET` đã được set (random string)
- [ ] Database đã được migrate

### 2. Local Development
- [ ] `npm install` chạy thành công
- [ ] `npm run dev` chạy không lỗi
- [ ] Truy cập http://localhost:3000 thành công
- [ ] Không có console errors trong browser

### 3. Database
- [ ] Prisma schema valid
- [ ] Migrations chạy thành công
- [ ] Có thể connect đến database
- [ ] Prisma Studio hoạt động (`npx prisma studio`)

## 🔬 Manual Testing

### Test 1: Create Mailbox

**Steps:**
1. Mở http://localhost:3000
2. Click nút "Tạo"

**Expected:**
- ✅ Email address xuất hiện (format: `xxxxxxxx@example.com`)
- ✅ Expiration time hiển thị
- ✅ "Đang chờ email..." message xuất hiện
- ✅ Copy button hoạt động

**Verify in Database:**
```bash
npx prisma studio
# Check Mailbox table có 1 record mới
```

### Test 2: Create Multiple Mailboxes

**Steps:**
1. Click "Ngẫu nhiên" 3 lần

**Expected:**
- ✅ 3 mailboxes khác nhau được tạo
- ✅ Dropdown "Mailbox đã tạo" xuất hiện
- ✅ Có thể switch giữa các mailboxes
- ✅ LocalStorage lưu mailboxes

**Verify:**
```javascript
// Browser console
localStorage.getItem('tempmail_mailboxes')
```

### Test 3: Receive Email (Webhook)

**Steps:**
1. Tạo mailbox, copy địa chỉ (ví dụ: `abc123@example.com`)
2. Mở terminal mới
3. Chạy curl command:

```bash
curl -X POST http://localhost:3000/api/webhooks/inbound-email \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Token: change-this-to-secure-random-string" \
  -d '{
    "recipient": "abc123@example.com",
    "sender": "test@example.com",
    "from": "Test Sender <test@example.com>",
    "subject": "Test Email Subject",
    "body-plain": "This is the plain text body of the test email.",
    "body-html": "<html><body><h1>Test Email</h1><p>This is the <strong>HTML</strong> body.</p></body></html>"
  }'
```

**Expected:**
- ✅ Response: `{"message":"Email received successfully"}`
- ✅ Email xuất hiện trong UI sau ~10 giây (polling)
- ✅ From, subject, time hiển thị đúng

**Verify in Database:**
```bash
npx prisma studio
# Check Message table có 1 record mới
```

### Test 4: View Email

**Steps:**
1. Click vào email trong list

**Expected:**
- ✅ Right panel hiển thị email detail
- ✅ Subject, from, time hiển thị đúng
- ✅ HTML tab hiển thị formatted content
- ✅ Text tab hiển thị plain text
- ✅ HTML được sanitized (không có script tags)

### Test 5: Multiple Emails

**Steps:**
1. Gửi 5 emails khác nhau qua webhook
2. Đợi polling update

**Expected:**
- ✅ Tất cả 5 emails xuất hiện
- ✅ Sorted theo thời gian (mới nhất trên cùng)
- ✅ Có thể click và view từng email

### Test 6: Expired Mailbox

**Steps:**
1. Trong database, set `expiresAt` của mailbox về quá khứ:

```sql
UPDATE Mailbox SET expiresAt = datetime('now', '-1 hour') WHERE id = 'your-mailbox-id';
```

2. Refresh page
3. Try to fetch messages

**Expected:**
- ✅ Mailbox không còn trong saved list
- ✅ API returns 410 Gone
- ✅ UI hiển thị "Mailbox expired" hoặc clear

### Test 7: Cleanup Script

**Steps:**
1. Tạo 2 mailboxes
2. Set 1 mailbox expired (như Test 6)
3. Run cleanup:

```bash
npm run cleanup
```

**Expected:**
- ✅ Console log: "Deleted 1 expired mailboxes"
- ✅ Expired mailbox bị xóa khỏi database
- ✅ Messages của mailbox đó cũng bị xóa (cascade)
- ✅ Active mailbox vẫn còn

### Test 8: Webhook Security

**Steps:**
1. Gửi webhook với sai token:

```bash
curl -X POST http://localhost:3000/api/webhooks/inbound-email \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Token: wrong-token" \
  -d '{"recipient":"test@example.com","sender":"test@test.com"}'
```

**Expected:**
- ✅ Response: 401 Unauthorized
- ✅ Email không được tạo trong database

### Test 9: Invalid Webhook Data

**Steps:**
1. Gửi webhook với missing fields:

```bash
curl -X POST http://localhost:3000/api/webhooks/inbound-email \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Token: change-this-to-secure-random-string" \
  -d '{"recipient":"test@example.com"}'
```

**Expected:**
- ✅ Response: 400 Bad Request hoặc 200 OK (không tạo message)

### Test 10: Non-existent Mailbox

**Steps:**
1. Gửi email đến mailbox không tồn tại:

```bash
curl -X POST http://localhost:3000/api/webhooks/inbound-email \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Token: change-this-to-secure-random-string" \
  -d '{
    "recipient": "nonexistent@example.com",
    "sender": "test@example.com",
    "subject": "Test"
  }'
```

**Expected:**
- ✅ Response: 200 OK (để tránh retry)
- ✅ Message không được tạo
- ✅ Log: "Mailbox not found or expired"

## 🌐 API Testing

### Using Postman/Insomnia

#### 1. Create Mailbox
```
POST http://localhost:3000/api/mailboxes
Content-Type: application/json

Response:
{
  "id": "clxxx...",
  "addressLocal": "abc123",
  "addressFull": "abc123@example.com",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "expiresAt": "2024-01-01T01:00:00.000Z"
}
```

#### 2. Get Messages
```
GET http://localhost:3000/api/mailboxes/{mailbox-id}/messages

Response:
[
  {
    "id": "clxxx...",
    "fromEmail": "test@example.com",
    "fromName": "Test Sender",
    "subject": "Test",
    "createdAt": "2024-01-01T00:30:00.000Z"
  }
]
```

#### 3. Get Message Detail
```
GET http://localhost:3000/api/messages/{message-id}

Response:
{
  "id": "clxxx...",
  "fromEmail": "test@example.com",
  "fromName": "Test Sender",
  "subject": "Test",
  "bodyText": "...",
  "bodyHtml": "...",
  "createdAt": "2024-01-01T00:30:00.000Z"
}
```

## 🔒 Security Testing

### Test XSS Protection

**Steps:**
1. Gửi email với malicious HTML:

```bash
curl -X POST http://localhost:3000/api/webhooks/inbound-email \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Token: change-this-to-secure-random-string" \
  -d '{
    "recipient": "abc123@example.com",
    "sender": "hacker@evil.com",
    "subject": "XSS Test",
    "body-html": "<script>alert(\"XSS\")</script><img src=x onerror=alert(1)><p>Normal content</p>"
  }'
```

**Expected:**
- ✅ Script tags bị remove
- ✅ onerror handlers bị remove
- ✅ Normal content vẫn hiển thị
- ✅ Không có alert popup

### Test SQL Injection

**Steps:**
1. Try SQL injection trong webhook:

```bash
curl -X POST http://localhost:3000/api/webhooks/inbound-email \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Token: change-this-to-secure-random-string" \
  -d '{
    "recipient": "test@example.com; DROP TABLE Mailbox;--",
    "sender": "test@test.com"
  }'
```

**Expected:**
- ✅ Không có SQL error
- ✅ Database không bị ảnh hưởng
- ✅ Prisma parameterized queries bảo vệ

## 📱 UI/UX Testing

### Responsive Design
- [ ] Desktop (1920x1080) - Layout đúng
- [ ] Laptop (1366x768) - Layout đúng
- [ ] Tablet (768x1024) - Responsive
- [ ] Mobile (375x667) - Responsive

### Browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers

### User Interactions
- [ ] Copy button works
- [ ] Dropdown selection works
- [ ] Message selection highlights
- [ ] HTML/Text toggle works
- [ ] Scrolling works in all panels
- [ ] Loading states display correctly

## 🚀 Production Testing

### Before Deploy

1. **Build Test:**
```bash
npm run build
npm start
# Test trên http://localhost:3000
```

2. **Environment Variables:**
- [ ] All required vars set
- [ ] No hardcoded secrets
- [ ] Domain configured correctly

3. **Database:**
- [ ] Production database accessible
- [ ] Migrations applied
- [ ] Backup strategy in place

### After Deploy

1. **Smoke Test:**
- [ ] Site loads
- [ ] Can create mailbox
- [ ] No console errors
- [ ] SSL certificate valid

2. **Email Provider:**
- [ ] DNS records configured
- [ ] MX records pointing correctly
- [ ] Webhook URL accessible
- [ ] Test email received

3. **Monitoring:**
- [ ] Logs accessible
- [ ] Error tracking setup
- [ ] Performance monitoring
- [ ] Uptime monitoring

## 🐛 Common Issues

### Issue: Emails not appearing

**Debug:**
1. Check webhook logs
2. Verify webhook secret matches
3. Check database for messages
4. Verify mailbox not expired
5. Check polling is working

### Issue: Database connection failed

**Debug:**
1. Verify DATABASE_URL
2. Check database is running
3. Test connection with Prisma Studio
4. Check firewall rules

### Issue: Build fails

**Debug:**
1. Clear `.next` folder
2. Delete `node_modules`
3. Run `npm install` again
4. Check TypeScript errors

## 📊 Performance Testing

### Load Test với Artillery

Install:
```bash
npm install -g artillery
```

Create `load-test.yml`:
```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: "Create mailbox"
    flow:
      - post:
          url: "/api/mailboxes"
```

Run:
```bash
artillery run load-test.yml
```

### Database Performance

```sql
-- Check slow queries
EXPLAIN ANALYZE SELECT * FROM "Message" WHERE "mailboxId" = 'xxx';

-- Check indexes
SELECT * FROM pg_indexes WHERE tablename IN ('Mailbox', 'Message');
```

## ✅ Final Checklist

Trước khi deploy production:

- [ ] All manual tests passed
- [ ] API tests passed
- [ ] Security tests passed
- [ ] UI/UX tests passed
- [ ] Build successful
- [ ] Environment configured
- [ ] Database ready
- [ ] Email provider configured
- [ ] Monitoring setup
- [ ] Backup strategy
- [ ] Documentation complete
- [ ] Team trained

## 📝 Test Report Template

```markdown
# Test Report - [Date]

## Environment
- Node version: 
- Database: 
- Browser: 

## Tests Executed
- [ ] Create Mailbox
- [ ] Receive Email
- [ ] View Email
- [ ] Cleanup
- [ ] Security

## Issues Found
1. [Issue description]
   - Severity: High/Medium/Low
   - Status: Open/Fixed
   - Notes: 

## Conclusion
- Ready for production: Yes/No
- Blockers: 
- Recommendations: 
```
