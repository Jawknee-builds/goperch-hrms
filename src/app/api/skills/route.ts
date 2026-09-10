import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userWhereClause: any = {};
  if (currentUser.role !== "CEO" && currentUser.departmentId) {
    userWhereClause = { departmentId: currentUser.departmentId };
  }

  const userSkills = await db.userSkill.findMany({
    where: {
      user: userWhereClause,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          title: true,
          department: true,
        },
      },
      skill: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const allSkills = await db.skill.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ userSkills, allSkills });
}

export async function POST(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { skillName, category, proficiency, notes } = await req.json();

    if (!skillName) {
      return NextResponse.json({ error: "Skill name is required" }, { status: 400 });
    }

    // Upsert the master skill definition
    const skill = await db.skill.upsert({
      where: { name: skillName.trim() },
      update: {},
      create: {
        name: skillName.trim(),
        category: category || "General",
      },
    });

    // Create or update the user's skill entry
    const userSkill = await db.userSkill.upsert({
      where: {
        userId_skillId: {
          userId: currentUser.id,
          skillId: skill.id,
        },
      },
      update: {
        proficiency: proficiency || "LEARNING",
        notes: notes || null,
      },
      create: {
        userId: currentUser.id,
        skillId: skill.id,
        proficiency: proficiency || "LEARNING",
        notes: notes || null,
      },
      include: {
        skill: true,
        user: { select: { id: true, name: true, department: true } },
      },
    });

    return NextResponse.json({ userSkill }, { status: 201 });
  } catch (error) {
    console.error("Create skill error:", error);
    return NextResponse.json({ error: "Failed to record skill" }, { status: 500 });
  }
}

