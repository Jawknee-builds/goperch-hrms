import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let whereClause: any = {};

  if (currentUser.role !== "CEO" && currentUser.departmentId) {
    whereClause = {
      askedBy: {
        departmentId: currentUser.departmentId,
      },
    };
  }

  const hurdles = await db.hurdle.findMany({
    where: whereClause,
    include: {
      askedBy: {
        select: { id: true, name: true, email: true, role: true, department: true },
      },
      answeredBy: {
        select: { id: true, name: true, email: true, role: true },
      },
      task: {
        select: { id: true, title: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ hurdles });
}

export async function POST(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, question, taskId } = await req.json();

    if (!title || !question) {
      return NextResponse.json({ error: "Title and question content are required" }, { status: 400 });
    }

    const hurdle = await db.hurdle.create({
      data: {
        title,
        question,
        taskId: taskId || null,
        askedById: currentUser.id,
        status: "OPEN",
      },
      include: {
        askedBy: { select: { id: true, name: true, email: true, department: true } },
        task: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ hurdle }, { status: 201 });
  } catch (error) {
    console.error("Create hurdle error:", error);
    return NextResponse.json({ error: "Failed to submit hurdle" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (currentUser.role === "EMPLOYEE") {
    return NextResponse.json({ error: "Forbidden: Only HODs or CEO can resolve hurdles" }, { status: 403 });
  }

  try {
    const { id, answer, status } = await req.json();

    if (!id || !answer) {
      return NextResponse.json({ error: "Hurdle ID and answer content are required" }, { status: 400 });
    }

    const hurdle = await db.hurdle.update({
      where: { id },
      data: {
        answer,
        status: status || "RESOLVED",
        answeredById: currentUser.id,
      },
      include: {
        askedBy: { select: { id: true, name: true, email: true } },
        answeredBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ hurdle });
  } catch (error) {
    console.error("Resolve hurdle error:", error);
    return NextResponse.json({ error: "Failed to resolve hurdle" }, { status: 500 });
  }
}

