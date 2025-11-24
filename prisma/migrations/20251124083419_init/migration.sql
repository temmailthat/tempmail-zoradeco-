-- CreateTable
CREATE TABLE "Mailbox" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "addressLocal" TEXT NOT NULL,
    "addressFull" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mailboxId" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "fromName" TEXT,
    "subject" TEXT,
    "bodyText" TEXT,
    "bodyHtml" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_mailboxId_fkey" FOREIGN KEY ("mailboxId") REFERENCES "Mailbox" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Mailbox_addressFull_key" ON "Mailbox"("addressFull");

-- CreateIndex
CREATE INDEX "Mailbox_expiresAt_idx" ON "Mailbox"("expiresAt");

-- CreateIndex
CREATE INDEX "Mailbox_addressLocal_idx" ON "Mailbox"("addressLocal");

-- CreateIndex
CREATE INDEX "Message_mailboxId_createdAt_idx" ON "Message"("mailboxId", "createdAt");
