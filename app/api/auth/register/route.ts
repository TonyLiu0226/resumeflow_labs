import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/app/lib/prisma";

function isEmailValid(email: string): boolean {
    const cond1 = email.includes("@");
    const cond2 = email.includes(".");
    const cond3 = email.split("@")[0].length > 0 && email.split("@")[1].length > 0 && email.split("@")[1].split(".")[0].length > 0;
    return cond1 && cond2 && cond3;
}

function isPasswordValid(password: string): boolean {
    return password.length > 5;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "email, and password are required" },
        { status: 400 }
      );
    }

    if (!(isEmailValid(email) && isPasswordValid(password))) {
        return NextResponse.json(
           { error: "Invalid email or password" },
           { status: 400 }
        )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
      },
      { status: 201 }
    );
  } catch {
    console.error("Registration error");
    return NextResponse.json(
      { error: "Something went wrong during registration" },
      { status: 500 }
    );
  }
}
