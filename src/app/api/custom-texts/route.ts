import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import CustomText from "@/models/CustomText";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDatabase();
    const texts = await CustomText.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(texts);
  } catch (error) {
    console.error("[CUSTOM_TEXTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { title, content, language } = body;

    if (!title || !content || !language) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    if (title.length > 255) {
      return new NextResponse("Title is too long", { status: 400 });
    }

    if (content.length > 10000) {
      return new NextResponse("Content is too long", { status: 400 });
    }

    await connectToDatabase();
    const text = await CustomText.create({
      title,
      content,
      language,
      userId: session.user.id,
    });

    return NextResponse.json(text);
  } catch (error) {
    console.error("[CUSTOM_TEXTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
