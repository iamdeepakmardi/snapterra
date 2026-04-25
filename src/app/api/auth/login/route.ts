import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { query } from "@/lib/db";
import { createToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    console.log("Login attempt for email:", email);

    const result = await query("SELECT * FROM users WHERE LOWER(email) = LOWER($1)", [email]);
    const user = result.rows[0];

    if (!user) {
      console.log("User not found in DB for email:", email);
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for email:", email);
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = createToken(user.id);
    await setAuthCookie(token);

    return NextResponse.json({ message: "Logged in successfully" });
  } catch (error) {
    console.error("Login Error: ", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
