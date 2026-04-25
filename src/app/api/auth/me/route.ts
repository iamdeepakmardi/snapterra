import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET() {
  const userId = await getUserIdFromRequest();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await query(
      "SELECT id, email, is_pro, storage_used FROM users WHERE id = $1",
      [userId],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Auth Me Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
