import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const channels = await db.channel.findMany({
    include: {
      department: true,
      _count: { select: { messages: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ channels });
}

export async function POST(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, description, isPrivate, departmentId } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Channel name is required" }, { status: 400 });
    }

    const cleanName = name.toLowerCase().trim().replace(/\s+/g, "-");

    const channel = await db.channel.create({
      data: {
        name: cleanName,
        description: description || null,
        isPrivate: !!isPrivate,
        departmentId: departmentId || null,
      },
      include: { department: true },
    });

    return NextResponse.json({ channel }, { status: 201 });
  } catch (error) {
    console.error("Create channel error:", error);
    return NextResponse.json({ error: "Failed to create channel" }, { status: 500 });
  }
}

