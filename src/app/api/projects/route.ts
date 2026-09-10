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
    const topFocusOnly = searchParams.get("topFocus") === "true";

    let whereClause: any = {};

    if (topFocusOnly) {
      whereClause.isTopFocus = true;
    } else if (currentUser.role === "CEO") {
      if (departmentIdParam && departmentIdParam !== "ALL") {
        whereClause.departmentId = departmentIdParam;
      }
    } else if (currentUser.role === "HOD") {
      whereClause.OR = [
        { departmentId: currentUser.departmentId || undefined },
        { createdById: currentUser.id },
      ];
    } else {
      whereClause.OR = [
        { departmentId: currentUser.departmentId || undefined },
        { createdById: currentUser.id },
      ];
    }

    const projects = await db.project.findMany({
      where: whereClause,
      include: {
        department: true,
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true, email: true } },
            createdBy: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        notes: {
          include: {
            author: { select: { id: true, name: true, email: true, role: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: [{ isTopFocus: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error("Fetch projects error:", error);
    return NextResponse.json({ projects: [], error: error?.message || "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, status, progress, isTopFocus, targetDate, departmentId } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Project title is required" }, { status: 400 });
    }

    const targetDeptId = departmentId || currentUser.departmentId;

    const project = await db.project.create({
      data: {
        title,
        description: description || null,
        status: status || "IN_PROGRESS",
        progress: typeof progress === "number" ? progress : 0,
        isTopFocus: Boolean(isTopFocus),
        targetDate: targetDate ? new Date(targetDate) : null,
        departmentId: targetDeptId || null,
        createdById: currentUser.id,
      },
      include: {
        department: true,
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        tasks: true,
        notes: true,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, title, description, status, progress, isTopFocus, targetDate } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const updatedProject = await db.project.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(typeof progress === "number" && { progress }),
        ...(typeof isTopFocus === "boolean" && { isTopFocus }),
        ...(targetDate !== undefined && { targetDate: targetDate ? new Date(targetDate) : null }),
      },
      include: {
        department: true,
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true, email: true } },
            createdBy: { select: { id: true, name: true, email: true } },
          },
        },
        notes: {
          include: {
            author: { select: { id: true, name: true, email: true, role: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({ project: updatedProject });
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}
