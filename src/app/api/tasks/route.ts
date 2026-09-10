import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const departmentIdParam = searchParams.get("departmentId");

    let whereClause: any = {};

    if (currentUser.role === "CEO") {
      if (departmentIdParam && departmentIdParam !== "ALL") {
        whereClause.departmentId = departmentIdParam;
      }
    } else if (currentUser.role === "HOD") {
      whereClause.OR = [
        { departmentId: currentUser.departmentId || undefined },
        { assignedToId: currentUser.id },
        { createdById: currentUser.id },
      ];
    } else {
      whereClause.OR = [
        { departmentId: currentUser.departmentId || undefined },
        { assignedToId: currentUser.id },
      ];
    }

    const tasks = await db.task.findMany({
      where: whereClause,
      include: {
        department: true,
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
        milestone: { select: { id: true, title: true } },
        project: { select: { id: true, title: true } },
        hurdles: { select: { id: true, title: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tasks });
  } catch (error: any) {
    console.error("Fetch tasks error:", error);
    return NextResponse.json({ tasks: [], error: error?.message || "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, priority, dueDate, assignedToId, departmentId, milestoneId, projectId } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 });
    }

    let targetDeptId = departmentId || currentUser.departmentId;

    if (assignedToId) {
      const assignee = await db.user.findUnique({ where: { id: assignedToId } });
      if (assignee?.departmentId) {
        targetDeptId = assignee.departmentId;
      }
    }

    if (!targetDeptId) {
      return NextResponse.json({ error: "Department is required for task creation" }, { status: 400 });
    }

    let targetAssigneeId = assignedToId;
    if (currentUser.role === "EMPLOYEE" && !assignedToId) {
      targetAssigneeId = currentUser.id;
    }

    const task = await db.task.create({
      data: {
        title,
        description: description || null,
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        departmentId: targetDeptId,
        createdById: currentUser.id,
        assignedToId: targetAssigneeId || null,
        milestoneId: milestoneId || null,
        projectId: projectId || null,
      },
      include: {
        department: true,
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        milestone: { select: { id: true, title: true } },
        project: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, status, priority, title, description, assignedToId, projectId } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const existingTask = await db.task.findUnique({ where: { id } });
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (currentUser.role === "EMPLOYEE") {
      if (existingTask.assignedToId !== currentUser.id && existingTask.createdById !== currentUser.id) {
        return NextResponse.json({ error: "Forbidden: You can only update your own tasks" }, { status: 403 });
      }
    }

    const updatedTask = await db.task.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(assignedToId !== undefined && { assignedToId }),
        ...(projectId !== undefined && { projectId }),
      },
      include: {
        department: true,
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        milestone: { select: { id: true, title: true } },
        project: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
