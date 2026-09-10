import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const targetUser = await db.user.findUnique({
    where: { id },
    include: {
      department: true,
      tasksAssigned: {
        include: {
          department: true,
          milestone: { select: { title: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      tasksCreated: {
        include: {
          department: true,
        },
        orderBy: { createdAt: "desc" },
      },
      skills: {
        include: {
          skill: true,
        },
        orderBy: { updatedAt: "desc" },
      },
      hurdlesAsked: {
        include: {
          answeredBy: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  if (
    currentUser.role !== "CEO" &&
    currentUser.id !== targetUser.id &&
    currentUser.departmentId !== targetUser.departmentId
  ) {
    return NextResponse.json({ error: "Forbidden: Scoped department access" }, { status: 403 });
  }

  const { password: _, ...userWithoutPassword } = targetUser;

  const totalTasks = userWithoutPassword.tasksAssigned.length;
  const completedTasks = userWithoutPassword.tasksAssigned.filter(
    (t) => t.status === "COMPLETED"
  ).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return NextResponse.json({
    employee: {
      ...userWithoutPassword,
      metrics: {
        totalTasks,
        completedTasks,
        completionRate,
      },
    },
  });
}

// Soft Delete / Archive Employee with Backup Protection
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (currentUser.role !== "CEO" && currentUser.role !== "HOD") {
    return NextResponse.json({ error: "Forbidden: Only CEO and HODs can delete employees" }, { status: 403 });
  }

  try {
    const { id } = await params;

    if (id === currentUser.id) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    const targetUser = await db.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const CORE_TEAM_EMAILS = [
      "ceo@goperch.com",
      "hod.sales@goperch.com",
      "hod.electronics@goperch.com",
      "hod.software@goperch.com",
    ];

    if (CORE_TEAM_EMAILS.includes(targetUser.email.toLowerCase())) {
      return NextResponse.json(
        { error: "Forbidden: Core leadership team members (Ryan Bantu, Jonathan Jaladi, Vikram, Prasanna) are protected and cannot be deleted." },
        { status: 400 }
      );
    }

    // Soft delete / archive to ensure complete data backup recovery
    const archivedUser = await db.user.update({
      where: { id },
      data: {
        isArchived: true,
        deletedAt: new Date(),
      },
    });

    const { password: _, ...safeUser } = archivedUser;

    return NextResponse.json({ message: "Employee archived to backup roster successfully", employee: safeUser });
  } catch (error) {
    console.error("Archive employee error:", error);
    return NextResponse.json({ error: "Failed to archive employee" }, { status: 500 });
  }
}

// Restore / Update Employee Details
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (currentUser.role !== "CEO" && currentUser.role !== "HOD") {
    return NextResponse.json({ error: "Forbidden: Only CEO and HODs can manage employee roster" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { isArchived, name, title, role, departmentId } = await req.json();

    const updatedUser = await db.user.update({
      where: { id },
      data: {
        ...(typeof isArchived === "boolean" && {
          isArchived,
          deletedAt: isArchived ? new Date() : null,
        }),
        ...(name && { name }),
        ...(title !== undefined && { title }),
        ...(role && { role }),
        ...(departmentId !== undefined && { departmentId }),
      },
      include: {
        department: true,
      },
    });

    const { password: _, ...safeUser } = updatedUser;

    return NextResponse.json({ employee: safeUser });
  } catch (error) {
    console.error("Update employee error:", error);
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
  }
}
