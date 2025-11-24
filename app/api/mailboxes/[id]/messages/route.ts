import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mailboxId = params.id;

    // Check if mailbox exists and is not expired
    const mailbox = await prisma.mailbox.findUnique({
      where: { id: mailboxId },
    });

    if (!mailbox) {
      return NextResponse.json(
        { error: "Mailbox not found" },
        { status: 404 }
      );
    }

    if (mailbox.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Mailbox expired" },
        { status: 410 }
      );
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: { mailboxId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fromEmail: true,
        fromName: true,
        subject: true,
        createdAt: true,
        mailboxId: true,
        bodyText: true,
        bodyHtml: true,
      },
    });

    return NextResponse.json(
      messages.map((msg) => ({
        ...msg,
        createdAt: msg.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
