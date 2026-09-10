import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { comparePassword, signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { department: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role as "CEO" | "HOD" | "EMPLOYEE",
      departmentId: user.departmentId,
    });

    const cookieStore = await cookies();
    cookieStore.set("hrms_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: "Logged in successfully",
      user: userWithoutPassword,
    });
  } catch (error: any) {
    console.error("Login route error:", error);
    const errorMessage = error?.message || "Internal server error";
    return NextResponse.json(
      {
        error: "Database error during login. Please ensure your Vercel Postgres database is attached and seeded with 'npx prisma db push && npx prisma db seed'.",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
