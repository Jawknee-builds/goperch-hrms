import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
  } catch (error: any) {
    console.error("Fetch departments error:", error);
    return NextResponse.json({ departments: [], error: error?.message || "Database query failed" }, { status: 500 });
  }
}
