import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signJWT } from "@/lib/auth";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password and generate UUID
    const hashedPassword = await hashPassword(password);
    const id = crypto.randomUUID();

    // Create the user in database
    const user = await prisma.user.create({
      data: {
        id,
        email,
        password: hashedPassword,
      },
    });

    // Generate JWT
    const token = await signJWT({ id: user.id, email: user.email });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
