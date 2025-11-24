import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseEmailAddress, extractLocalPart } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret (temporarily disabled for testing)
    // TODO: Re-enable authentication after testing
    // const webhookSecret = request.headers.get("x-webhook-token");
    // const expectedSecret = process.env.INBOUND_WEBHOOK_SECRET;

    // if (!expectedSecret || webhookSecret !== expectedSecret) {
    //   return NextResponse.json(
    //     { error: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }

    // Parse request body (format depends on email provider)
    const body = await request.json();

    // Extract email data (adjust based on your provider)
    // This example works with Mailgun format
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

    // Extract local part from recipient email
    const recipientEmail = Array.isArray(to) ? to[0] : to;
    const localPart = extractLocalPart(recipientEmail);

    // Find active mailbox
    const mailbox = await prisma.mailbox.findFirst({
      where: {
        addressLocal: localPart,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!mailbox) {
      // Mailbox not found or expired, but return 200 to avoid retries
      return NextResponse.json({ message: "Mailbox not found or expired" });
    }

    // Parse sender info
    const { name: fromName, email: fromEmail } = parseEmailAddress(from);

    // Create message
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
