export interface Mailbox {
  id: string;
  addressLocal: string;
  addressFull: string;
  createdAt: string;
  expiresAt: string;
}

export interface Message {
  id: string;
  mailboxId: string;
  fromEmail: string;
  fromName: string | null;
  subject: string | null;
  bodyText: string | null;
  bodyHtml: string | null;
  createdAt: string;
}

export interface MessageListItem {
  id: string;
  fromEmail: string;
  fromName: string | null;
  subject: string | null;
  createdAt: string;
}
