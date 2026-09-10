import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("hrms_token");

  return NextResponse.json({ message: "Logged out successfully" });
}

