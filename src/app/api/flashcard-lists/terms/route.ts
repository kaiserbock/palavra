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
    const { listId, termId } = await request.json();

    if (!listId || !termId) {
      return NextResponse.json(
        { error: "List ID and term ID are required" },
        { status: 400 }
      );
    }

    const list = await FlashcardList.findOneAndUpdate(
      { _id: listId, userId },
      { $addToSet: { termIds: termId } },
      { new: true }
    );

    if (!list) {
      return NextResponse.json(
        { error: "Flashcard list not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(list);
  } catch (error) {
    console.error("Error adding term to flashcard list:", error);
    return NextResponse.json(
      {
        error: "Failed to add term to flashcard list",
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
    const termId = searchParams.get("termId");

    if (!listId || !termId) {
      return NextResponse.json(
        { error: "List ID and term ID are required" },
        { status: 400 }
      );
    }

    const list = await FlashcardList.findOneAndUpdate(
      { _id: listId, userId },
      { $pull: { termIds: termId } },
      { new: true }
    );

    if (!list) {
      return NextResponse.json(
        { error: "Flashcard list not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(list);
  } catch (error) {
    console.error("Error removing term from flashcard list:", error);
    return NextResponse.json(
      {
        error: "Failed to remove term from flashcard list",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
