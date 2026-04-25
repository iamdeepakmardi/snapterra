import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { query } from "@/lib/db";
import { createToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // 1. Check if user already exists
    const existingUser = await query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
      [email],
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create user
    const result = await query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id",
      [email, hashedPassword],
    );

    const userId = result.rows[0].id;

    // 4. Create session
    const token = createToken(userId);
    await setAuthCookie(token);

    return NextResponse.json(
      { message: "User created successfully", userId },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
