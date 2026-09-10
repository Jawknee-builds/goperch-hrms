import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const includeArchived = searchParams.get("archived") === "true";

  let whereClause: any = {};
  if (!includeArchived) {
    whereClause.isArchived = false;
  }

  if (currentUser.role === "HOD") {
    // HOD sees users in their department
    whereClause.OR = [
      { departmentId: currentUser.departmentId || undefined },
      { id: currentUser.id },
    ];
  }

  const employees = await db.user.findMany({
    where: whereClause,
    include: {
      department: true,
    },
    orderBy: [{ isArchived: "asc" }, { name: "asc" }],
  });

  const safeEmployees = employees.map(({ password: _, ...emp }) => emp);

  return NextResponse.json({ employees: safeEmployees });
}

export async function POST(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Permission: CEO and HOD can add employees
  if (currentUser.role !== "CEO" && currentUser.role !== "HOD") {
    return NextResponse.json({ error: "Forbidden: Only CEO and HODs can add employees" }, { status: 403 });
  }

  try {
    const { name, email, role, title, departmentId, password } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: "Name and Email are required" }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      return NextResponse.json({ error: "An employee with this email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password || "password123", 10);
    const targetDeptId = departmentId || currentUser.departmentId;

    const newEmployee = await db.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role: role || "EMPLOYEE",
        title: title || "Team Member",
        departmentId: targetDeptId || null,
        password: hashedPassword,
        isArchived: false,
      },
      include: {
        department: true,
      },
    });

    const { password: _, ...safeEmployee } = newEmployee;

    return NextResponse.json({ employee: safeEmployee }, { status: 201 });
  } catch (error) {
    console.error("Create employee error:", error);
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}

