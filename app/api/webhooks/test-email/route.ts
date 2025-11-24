import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseEmailAddress, extractLocalPart } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const to = body.recipient || body.to || body.envelope?.to;
    const from = body.sender || body.from || body.envelope?.from;
    const subject = body.subject || body["Subject"] || "";
    const bodyText = body["body-plain"] || body.text || body["stripped-text"] || "";
    const bodyHtml = body["body-html"] || body.html || body["stripped-html"] || "";

    if (!to || !from) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const recipientEmail = Array.isArray(to) ? to[0] : to;
    const localPart = extractLocalPart(recipientEmail);

    const mailbox = await prisma.mailbox.findFirst({
      where: {
        addressLocal: localPart,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!mailbox) {
      return NextResponse.json({ message: "Mailbox not found or expired" });
    }

    const { name: fromName, email: fromEmail } = parseEmailAddress(from);

    await prisma.message.create({
      data: {
        mailboxId: mailbox.id,
        fromEmail,
        fromName,
        subject,
        bodyText,
        bodyHtml,
      },
    });

    return NextResponse.json({ message: "Email received successfully" });
  } catch (error) {
    console.error("Failed to process inbound email:", error);
    return NextResponse.json(
      { error: "Failed to process email" },
      { status: 500 }
    );
  }
}
