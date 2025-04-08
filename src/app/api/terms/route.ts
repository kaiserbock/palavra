import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import Term from "@/models/Term";

export async function POST(request: Request) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { text, language, translation, category } = await request.json();

    if (!text || !language) {
      return NextResponse.json(
        { error: "Text and language are required" },
        { status: 400 }
      );
    }

    // Use findOneAndUpdate with upsert to avoid duplicates
    const term = await Term.findOneAndUpdate(
      { text, language, userId },
      { text, language, translation, category, userId },
      { upsert: true, new: true }
    );

    return NextResponse.json(term);
  } catch (error) {
    console.error("Error saving term:", error);
    return NextResponse.json({ error: "Failed to save term" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language");

    const query = language ? { language, userId } : { userId };
    const terms = await Term.find(query).sort({ createdAt: -1 });

    return NextResponse.json(terms);
  } catch (error) {
    console.error("Error fetching terms:", error);
    return NextResponse.json(
      { error: "Failed to fetch terms" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const text = searchParams.get("text");
    const language = searchParams.get("language");

    if (!text || !language) {
      return NextResponse.json(
        { error: "Text and language are required" },
        { status: 400 }
      );
    }

    await Term.deleteOne({ text, language, userId });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting term:", error);
    return NextResponse.json(
      { error: "Failed to delete term" },
      { status: 500 }
    );
  }
}
