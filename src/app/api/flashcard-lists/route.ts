import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import FlashcardList from "@/models/FlashcardList";
import { Connection } from "mongoose";

// Cache the database connection
let dbConnection: Connection | null = null;

async function getDbConnection() {
  if (!dbConnection) {
    dbConnection = await connectToDatabase();
  }
  return dbConnection;
}

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

    await getDbConnection();
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const flashcardList = await FlashcardList.create({
      name,
      termIds: [],
      userId,
    });

    return NextResponse.json(flashcardList);
  } catch (error) {
    console.error("Error creating flashcard list:", error);
    return NextResponse.json(
      {
        error: "Failed to create flashcard list",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await getDbConnection();
    const lists = await FlashcardList.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(lists);
  } catch (error) {
    console.error("Error fetching flashcard lists:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch flashcard lists",
        details: error instanceof Error ? error.message : "Unknown error",
      },
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

    await getDbConnection();
    const { searchParams } = new URL(request.url);
    const listId = searchParams.get("listId");

    if (!listId) {
      return NextResponse.json(
        { error: "List ID is required" },
        { status: 400 }
      );
    }

    const result = await FlashcardList.deleteOne({ _id: listId, userId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Flashcard list not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting flashcard list:", error);
    return NextResponse.json(
      {
        error: "Failed to delete flashcard list",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
