import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "goperch-hrms-super-secret-jwt-key-2026"
);

export interface JWTPayload {
  userId: string;
  email: string;
  role: "CEO" | "HOD" | "EMPLOYEE";
  departmentId?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("hrms_token")?.value;
    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload?.userId) return null;

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      include: {
        department: true,
      },
    });

    if (!user) return null;

    // Omit password hash
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (err: any) {
    if (err && typeof err === "object" && err.digest === "DYNAMIC_SERVER_USAGE") {
      throw err;
    }
    console.error("Error in getCurrentUser:", err);
    return null;
  }
}
