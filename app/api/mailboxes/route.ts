import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateRandomLocalPart } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const domain = process.env.TEMPMAIL_DOMAIN || "example.com";
    const ttlMinutes = parseInt(process.env.MAILBOX_TTL_MINUTES || "60", 10);

    // Generate random local part
    const addressLocal = generateRandomLocalPart(8);
    const addressFull = `${addressLocal}@${domain}`;

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + ttlMinutes);

    // Create mailbox
    const mailbox = await prisma.mailbox.create({
      data: {
        addressLocal,
        addressFull,
        expiresAt,
      },
    });

    return NextResponse.json({
      id: mailbox.id,
      addressLocal: mailbox.addressLocal,
      addressFull: mailbox.addressFull,
      createdAt: mailbox.createdAt.toISOString(),
      expiresAt: mailbox.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Failed to create mailbox:", error);
    return NextResponse.json(
      { error: "Failed to create mailbox" },
      { status: 500 }
    );
  }
}
