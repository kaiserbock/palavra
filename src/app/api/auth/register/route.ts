import { NextResponse } from "next/server";
import { User } from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const { name, email, password, nativeLanguage, learningLanguage } =
      await request.json();

    // Validate required fields
    if (!name || !email || !password || !nativeLanguage || !learningLanguage) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 }
      );
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      nativeLanguage,
      learningLanguage,
    });

    // Remove password from response
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    return NextResponse.json(
      { message: "User registered successfully", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
