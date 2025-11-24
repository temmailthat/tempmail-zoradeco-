import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication for internal endpoints
    const authHeader = request.headers.get("authorization");
    const expectedAuth = process.env.INTERNAL_API_SECRET;

    if (expectedAuth && authHeader !== `Bearer ${expectedAuth}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete expired mailboxes (cascade will delete messages)
    const result = await prisma.mailbox.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return NextResponse.json({
      message: "Cleanup completed",
      deletedMailboxes: result.count,
    });
  } catch (error) {
    console.error("Failed to cleanup expired mailboxes:", error);
    return NextResponse.json(
      { error: "Failed to cleanup" },
      { status: 500 }
    );
  }
}
