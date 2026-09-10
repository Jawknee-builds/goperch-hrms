import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const channelId = searchParams.get("channelId");
  const recipientId = searchParams.get("recipientId");

  let whereClause: any = {};

  if (channelId) {
    whereClause.channelId = channelId;
  } else if (recipientId) {
    // 1-on-1 Direct Message between currentUser and recipientId
    whereClause.OR = [
      { senderId: currentUser.id, recipientId: recipientId },
      { senderId: recipientId, recipientId: currentUser.id },
    ];
  } else {
    return NextResponse.json({ error: "Specify channelId or recipientId" }, { status: 400 });
  }

  const messages = await db.message.findMany({
    where: whereClause,
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          title: true,
          department: true,
        },
      },
      recipient: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content, channelId, recipientId } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Message content cannot be empty" }, { status: 400 });
    }

    if (!channelId && !recipientId) {
      return NextResponse.json({ error: "Specify channelId or recipientId" }, { status: 400 });
    }

    const message = await db.message.create({
      data: {
        content: content.trim(),
        senderId: currentUser.id,
        channelId: channelId || null,
        recipientId: recipientId || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            title: true,
            department: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Post message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

