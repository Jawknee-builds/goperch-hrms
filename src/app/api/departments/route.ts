import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // CEO sees all departments; HOD & Employee see departments
  const departments = await db.department.findMany({
    include: {
      users: {
        where: { isArchived: false },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          title: true,
          departmentId: true,
        },
      },
      milestones: true,
      _count: {
        select: {
          tasks: true,
          users: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ departments });
}

