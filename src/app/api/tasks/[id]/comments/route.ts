import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: taskId } = await params;

    const comments = await db.taskComment.findMany({
      where: { taskId },
      include: {
        author: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ comments });
  } catch (error: any) {
    console.error("Get task comments error:", error);
    return NextResponse.json({ comments: [], error: error?.message || "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: taskId } = await params;
    const { content } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    const task = await db.task.findUnique({
      where: { id: taskId },
      include: { createdBy: true, assignedTo: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const comment = await db.taskComment.create({
      data: {
        content: content.trim(),
        taskId,
        authorId: currentUser.id,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    // Notify task creator (Manager/CEO) if comment is by assignee or someone else
    if (task.createdById && task.createdById !== currentUser.id) {
      await db.notification.create({
        data: {
          userId: task.createdById,
          title: "New Ticket Comment",
          message: `${currentUser.name} commented on '${task.title}': "${content.slice(0, 50)}${content.length > 50 ? '...' : ''}"`,
          link: "#tasks",
        },
      });
    }

    // Notify assigned employee if commenter is manager/CEO
    if (task.assignedToId && task.assignedToId !== currentUser.id && task.assignedToId !== task.createdById) {
      await db.notification.create({
        data: {
          userId: task.assignedToId,
          title: "New Ticket Comment",
          message: `${currentUser.name} commented on your ticket '${task.title}'`,
          link: "#tasks",
        },
      });
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error: any) {
    console.error("Create task comment error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create comment" }, { status: 500 });
  }
}
