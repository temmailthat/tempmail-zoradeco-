# 📁 Project Structure

Cấu trúc chi tiết của TempMail project.

## 🌳 Directory Tree

```
tempmail-app/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── mailboxes/
│   │   │   ├── [id]/
│   │   │   │   └── messages/
│   │   │   │       └── route.ts  # GET /api/mailboxes/:id/messages
│   │   │   └── route.ts          # POST /api/mailboxes
│   │   ├── messages/
│   │   │   └── [id]/
│   │   │       └── route.ts      # GET /api/messages/:id
│   │   ├── webhooks/
│   │   │   └── inbound-email/
│   │   │       └── route.ts      # POST /api/webhooks/inbound-email
│   │   └── internal/
│   │       └── cleanup-expired/
│   │           └── route.ts      # POST /api/internal/cleanup-expired
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
│
├── components/                   # React Components
│   ├── Sidebar.tsx               # Left sidebar với controls
│   ├── MailboxList.tsx           # Middle panel - email list
│   └── MessageViewer.tsx         # Right panel - email viewer
│
├── lib/                          # Utilities
│   ├── prisma.ts                 # Prisma client singleton
│   └── utils.ts                  # Helper functions
│
├── prisma/                       # Database
│   └── schema.prisma             # Database schema
│
├── scripts/                      # Scripts
│   └── cleanup.ts                # Cleanup expired mailboxes
│
├── types/                        # TypeScript types
│   └── index.ts                  # Shared types
│
├── .env                          # Environment variables (local)
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── .dockerignore                 # Docker ignore rules
├── Dockerfile                    # Docker image definition
├── docker-compose.yml            # Docker Compose config
├── next.config.mjs               # Next.js configuration
├── package.json                  # Dependencies
├── postcss.config.mjs            # PostCSS config
├── tailwind.config.ts            # Tailwind CSS config
├── tsconfig.json                 # TypeScript config
├── README.md                     # Main documentation
├── QUICKSTART.md                 # Quick start guide
├── DEPLOYMENT.md                 # Deployment guide
├── DOCKER.md                     # Docker guide
├── WEBHOOK_EXAMPLES.md           # Webhook examples
└── PROJECT_STRUCTURE.md          # This file
```

## 📄 File Descriptions

### Core Application Files

#### `app/page.tsx`
- Main page component
- Manages state cho mailboxes, messages, selected message
- Handles polling cho new messages
- LocalStorage management

#### `app/layout.tsx`
- Root layout wrapper
- Metadata configuration
- Font loading

#### `app/globals.css`
- Global CSS styles
- Tailwind directives
- Custom scrollbar styles

### Components

#### `components/Sidebar.tsx`
- Left sidebar UI
- Mailbox creation controls
- Domain selection
- Clock display
- Saved mailboxes dropdown

#### `components/MailboxList.tsx`
- Middle panel
- Email address display với copy button
- Messages list
- Loading states
- Empty states

#### `components/MessageViewer.tsx`
- Right panel
- Message detail view
- HTML/Text toggle
- HTML sanitization
- Empty state

### API Routes

#### `app/api/mailboxes/route.ts`
**POST /api/mailboxes**
- Creates new mailbox
- Generates random local part
- Sets expiration time
- Returns mailbox data

#### `app/api/mailboxes/[id]/messages/route.ts`
**GET /api/mailboxes/:id/messages**
- Fetches messages for mailbox
- Checks mailbox expiration
- Returns sorted messages (newest first)

#### `app/api/messages/[id]/route.ts`
**GET /api/messages/:id**
- Fetches single message detail
- Returns full message content

#### `app/api/webhooks/inbound-email/route.ts`
**POST /api/webhooks/inbound-email**
- Receives inbound emails from provider
- Validates webhook secret
- Parses email data
- Creates message in database
- Handles multiple email formats

#### `app/api/internal/cleanup-expired/route.ts`
**POST /api/internal/cleanup-expired**
- Deletes expired mailboxes
- Cascades to delete messages
- Optional authentication

### Library Files

#### `lib/prisma.ts`
- Prisma client singleton
- Prevents multiple instances in development
- Connection pooling

#### `lib/utils.ts`
- `generateRandomLocalPart()` - Generate random email prefix
- `parseEmailAddress()` - Parse "Name <email>" format
- `extractLocalPart()` - Extract username from email
- `isValidEmail()` - Email validation

### Database

#### `prisma/schema.prisma`
- Database schema definition
- Two models: Mailbox, Message
- Indexes for performance
- Cascade delete rules

### Scripts

#### `scripts/cleanup.ts`
- Standalone cleanup script
- Can be run via cron
- Deletes expired mailboxes

### Types

#### `types/index.ts`
- Shared TypeScript interfaces
- Mailbox type
- Message type
- MessageListItem type

### Configuration Files

#### `next.config.mjs`
- Next.js configuration
- Standalone output for Docker
- React strict mode

#### `tailwind.config.ts`
- Tailwind CSS configuration
- Custom colors
- Content paths

#### `tsconfig.json`
- TypeScript configuration
- Path aliases (@/*)
- Compiler options

#### `package.json`
- Dependencies
- Scripts
- Project metadata

#### `.env.example`
- Environment variables template
- Documentation for each variable

#### `Dockerfile`
- Multi-stage Docker build
- Optimized for production
- Non-root user

#### `docker-compose.yml`
- PostgreSQL + App services
- Volume management
- Network configuration

## 🔄 Data Flow

### Creating a Mailbox

```
User clicks "Tạo"
  ↓
Frontend: POST /api/mailboxes
  ↓
Backend: Generate random local part
  ↓
Backend: Create mailbox in DB
  ↓
Backend: Return mailbox data
  ↓
Frontend: Save to state + localStorage
  ↓
Frontend: Start polling for messages
```

### Receiving an Email

```
Email Provider receives email
  ↓
Provider: POST /api/webhooks/inbound-email
  ↓
Backend: Validate webhook secret
  ↓
Backend: Parse email data
  ↓
Backend: Find matching mailbox
  ↓
Backend: Create message in DB
  ↓
Frontend: Polling detects new message
  ↓
Frontend: Display in UI
```

### Viewing a Message

```
User clicks message in list
  ↓
Frontend: Set selectedMessage state
  ↓
MessageViewer: Sanitize HTML
  ↓
MessageViewer: Render content
```

### Cleanup Process

```
Cron job triggers
  ↓
Script: Connect to database
  ↓
Script: Find expired mailboxes
  ↓
Script: Delete mailboxes (cascade to messages)
  ↓
Script: Log results
```

## 🗄️ Database Schema

### Mailbox Table

| Column       | Type     | Description                    |
|--------------|----------|--------------------------------|
| id           | String   | Primary key (CUID)             |
| addressLocal | String   | Local part (before @)          |
| addressFull  | String   | Full email address (unique)    |
| createdAt    | DateTime | Creation timestamp             |
| expiresAt    | DateTime | Expiration timestamp           |

**Indexes:**
- `addressLocal` - Fast lookup for incoming emails
- `expiresAt` - Fast cleanup queries

### Message Table

| Column    | Type     | Description                    |
|-----------|----------|--------------------------------|
| id        | String   | Primary key (CUID)             |
| mailboxId | String   | Foreign key to Mailbox         |
| fromEmail | String   | Sender email                   |
| fromName  | String?  | Sender name (optional)         |
| subject   | String?  | Email subject (optional)       |
| bodyText  | String?  | Plain text body (optional)     |
| bodyHtml  | String?  | HTML body (optional)           |
| createdAt | DateTime | Received timestamp             |

**Indexes:**
- `mailboxId, createdAt` - Fast message listing

**Relations:**
- Message.mailbox → Mailbox (onDelete: Cascade)

## 🔐 Security Features

1. **Webhook Authentication**
   - X-Webhook-Token header validation
   - Prevents unauthorized email injection

2. **HTML Sanitization**
   - DOMPurify removes dangerous HTML
   - Prevents XSS attacks

3. **Mailbox Privacy**
   - CUID prevents ID guessing
   - No API to list all mailboxes
   - Expiration enforcement

4. **Database Security**
   - Prepared statements (Prisma)
   - SQL injection prevention
   - Cascade deletes

## 🎨 UI Components Breakdown

### Sidebar (Left - 320px)
- Logo/Title
- Username input (optional)
- Domain selector
- Create button (green)
- Random button (red)
- Cancel button
- Saved mailboxes dropdown
- Clock display

### MailboxList (Middle - Flex 1)
- Email address display
- Copy button
- Expiration time
- Messages list:
  - From name/email
  - Subject
  - Relative time
  - Selected highlight

### MessageViewer (Right - 384px)
- Subject header
- From information
- Timestamp
- HTML/Text toggle
- Message body:
  - Sanitized HTML view
  - Plain text view

## 📦 Dependencies

### Production
- `next` - Framework
- `react`, `react-dom` - UI library
- `@prisma/client` - Database ORM
- `isomorphic-dompurify` - HTML sanitization
- `date-fns` - Date formatting
- `lucide-react` - Icons

### Development
- `typescript` - Type safety
- `prisma` - Database toolkit
- `tailwindcss` - Styling
- `tsx` - TypeScript execution
- `eslint` - Linting

## 🚀 Build Process

1. **Install dependencies** - `npm install`
2. **Generate Prisma Client** - `npx prisma generate`
3. **Run migrations** - `npx prisma migrate dev`
4. **Build Next.js** - `npm run build`
5. **Start server** - `npm start`

## 📊 Performance Considerations

- **Polling interval**: 10 seconds (configurable)
- **Database indexes**: Optimized queries
- **Cascade deletes**: Automatic cleanup
- **Standalone output**: Smaller Docker images
- **Connection pooling**: Prisma handles connections

## 🔮 Future Enhancements

Possible improvements:

1. **WebSocket/SSE** - Real-time updates thay vì polling
2. **Multiple domains** - Support nhiều domain
3. **Attachments** - Handle file attachments
4. **Search** - Search trong messages
5. **Export** - Export emails
6. **API keys** - Programmatic access
7. **Rate limiting** - Prevent abuse
8. **Analytics** - Usage statistics
9. **Custom TTL** - Per-mailbox expiration
10. **Email forwarding** - Forward to real email
