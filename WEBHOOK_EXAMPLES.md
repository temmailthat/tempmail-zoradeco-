# Webhook Examples

Các ví dụ về format webhook từ các email provider phổ biến.

## Mailgun Webhook Format

### Request Headers
```
Content-Type: application/json
X-Webhook-Token: your-secret-token
User-Agent: Mailgun/1.0
```

### Request Body
```json
{
  "sender": "sender@example.com",
  "recipient": "abc123@yourdomain.com",
  "from": "Sender Name <sender@example.com>",
  "subject": "Test Email",
  "body-plain": "This is the plain text body",
  "body-html": "<html><body><p>This is the HTML body</p></body></html>",
  "stripped-text": "This is the plain text body",
  "stripped-html": "<p>This is the HTML body</p>",
  "message-headers": [
    ["Received", "..."],
    ["Date", "Mon, 01 Jan 2024 12:00:00 +0000"],
    ["From", "Sender Name <sender@example.com>"],
    ["To", "abc123@yourdomain.com"],
    ["Subject", "Test Email"]
  ],
  "content-id-map": {},
  "timestamp": 1704110400,
  "token": "...",
  "signature": "..."
}
```

## SendGrid Inbound Parse Format

### Request Headers
```
Content-Type: multipart/form-data
User-Agent: SendGrid
```

### Request Body (Form Data)
```
to: abc123@yourdomain.com
from: Sender Name <sender@example.com>
sender_ip: 192.168.1.1
subject: Test Email
text: This is the plain text body
html: <html><body><p>This is the HTML body</p></body></html>
headers: Received: ...
Date: Mon, 01 Jan 2024 12:00:00 +0000
From: Sender Name <sender@example.com>
To: abc123@yourdomain.com
Subject: Test Email
envelope: {"to":["abc123@yourdomain.com"],"from":"sender@example.com"}
charsets: {"to":"UTF-8","from":"UTF-8","subject":"UTF-8","text":"UTF-8"}
SPF: pass
```

## AWS SES via SNS Format

### Request Headers
```
Content-Type: application/json
x-amz-sns-message-type: Notification
```

### Request Body
```json
{
  "Type": "Notification",
  "MessageId": "...",
  "TopicArn": "arn:aws:sns:...",
  "Subject": "Amazon SES Email Receipt Notification",
  "Message": "{\"notificationType\":\"Received\",\"mail\":{\"timestamp\":\"2024-01-01T12:00:00.000Z\",\"source\":\"sender@example.com\",\"messageId\":\"...\",\"destination\":[\"abc123@yourdomain.com\"],\"headers\":[{\"name\":\"From\",\"value\":\"Sender Name <sender@example.com>\"},{\"name\":\"To\",\"value\":\"abc123@yourdomain.com\"},{\"name\":\"Subject\",\"value\":\"Test Email\"}],\"commonHeaders\":{\"from\":[\"Sender Name <sender@example.com>\"],\"to\":[\"abc123@yourdomain.com\"],\"subject\":\"Test Email\"}},\"receipt\":{\"timestamp\":\"2024-01-01T12:00:00.000Z\",\"processingTimeMillis\":123,\"recipients\":[\"abc123@yourdomain.com\"],\"spamVerdict\":{\"status\":\"PASS\"},\"virusVerdict\":{\"status\":\"PASS\"}},\"content\":\"...base64 encoded MIME content...\"}",
  "Timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Testing Webhooks Locally

### Using ngrok

```bash
# Install ngrok
npm install -g ngrok

# Start your dev server
npm run dev

# In another terminal, start ngrok
ngrok http 3000

# Use the ngrok URL in your email provider webhook settings
# Example: https://abc123.ngrok.io/api/webhooks/inbound-email
```

### Using curl

```bash
# Test Mailgun format
curl -X POST http://localhost:3000/api/webhooks/inbound-email \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Token: your-secret-token" \
  -d '{
    "sender": "test@example.com",
    "recipient": "abc123@yourdomain.com",
    "from": "Test Sender <test@example.com>",
    "subject": "Test Email",
    "body-plain": "This is a test email",
    "body-html": "<p>This is a test email</p>"
  }'
```

### Using Postman

1. Create new POST request
2. URL: `http://localhost:3000/api/webhooks/inbound-email`
3. Headers:
   - `Content-Type`: `application/json`
   - `X-Webhook-Token`: `your-secret-token`
4. Body (raw JSON):
```json
{
  "sender": "test@example.com",
  "recipient": "abc123@yourdomain.com",
  "from": "Test Sender <test@example.com>",
  "subject": "Test Email",
  "body-plain": "This is a test email",
  "body-html": "<p>This is a test email</p>"
}
```

## Adapting Webhook Handler

Nếu bạn sử dụng provider khác, cần modify `app/api/webhooks/inbound-email/route.ts`:

```typescript
// Example for custom provider
const body = await request.json();

// Map fields based on your provider
const to = body.to || body.recipient || body.envelope?.to;
const from = body.from || body.sender || body.envelope?.from;
const subject = body.subject || body.Subject;
const bodyText = body.text || body["body-plain"] || body.bodyText;
const bodyHtml = body.html || body["body-html"] || body.bodyHtml;
```

## Webhook Security

### Verify Mailgun Signature

```typescript
import crypto from 'crypto';

function verifyMailgunSignature(
  timestamp: string,
  token: string,
  signature: string
): boolean {
  const encodedToken = crypto
    .createHmac('sha256', process.env.MAILGUN_API_KEY!)
    .update(timestamp + token)
    .digest('hex');
  
  return encodedToken === signature;
}
```

### Verify SendGrid Signature

```typescript
import crypto from 'crypto';

function verifySendGridSignature(
  publicKey: string,
  payload: string,
  signature: string,
  timestamp: string
): boolean {
  const verifier = crypto.createVerify('sha256');
  verifier.update(timestamp + payload);
  return verifier.verify(publicKey, signature, 'base64');
}
```

### IP Whitelist

```typescript
const allowedIPs = [
  '192.168.1.1', // Mailgun IP
  '10.0.0.1',    // SendGrid IP
];

const clientIP = request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip');

if (!allowedIPs.includes(clientIP)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```
