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
    whereClause.departmentId = currentUser.departmentId;
  }

  const milestones = await db.milestone.findMany({
    where: whereClause,
    include: {
      department: true,
      tasks: {
        select: {
          id: true,
          status: true,
        },
      },
    },
    orderBy: { targetDate: "asc" },
  });

  const milestonesWithProgress = milestones.map((m) => {
    const totalTasks = m.tasks.length;
    const completedTasks = m.tasks.filter((t) => t.status === "COMPLETED").length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      ...m,
      totalTasks,
      completedTasks,
      progress,
    };
  });

  return NextResponse.json({ milestones: milestonesWithProgress });
}

export async function POST(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (currentUser.role === "EMPLOYEE") {
    return NextResponse.json({ error: "Forbidden: Employees cannot create milestones" }, { status: 403 });
  }

  try {
    const { title, description, targetDate, departmentId } = await req.json();

    if (!title || !targetDate) {
      return NextResponse.json({ error: "Title and target date are required" }, { status: 400 });
    }

    const targetDeptId = currentUser.role === "CEO" ? departmentId : currentUser.departmentId;
    if (!targetDeptId) {
      return NextResponse.json({ error: "Department is required" }, { status: 400 });
    }

    const milestone = await db.milestone.create({
      data: {
        title,
        description: description || null,
        targetDate: new Date(targetDate),
        departmentId: targetDeptId,
      },
      include: { department: true },
    });

    return NextResponse.json({ milestone }, { status: 201 });
  } catch (error) {
    console.error("Create milestone error:", error);
    return NextResponse.json({ error: "Failed to create milestone" }, { status: 500 });
  }
}

