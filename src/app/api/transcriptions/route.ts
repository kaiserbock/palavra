import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Transcription from "@/models/Transcription";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";
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
    const { videoId, url, name, title, language, enhancedTranscript } =
      await request.json();

    if (!videoId || !url || !language || !name || !enhancedTranscript) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const transcription = await Transcription.findOneAndUpdate(
      { videoId, userId },
      {
        videoId,
        url,
        name,
        title,
        language,
        transcript: enhancedTranscript,
        userId,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(transcription);
  } catch (error) {
    console.error("Error saving transcription:", error);
    return NextResponse.json(
      {
        error: "Failed to save transcription",
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
    const transcriptions = await Transcription.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(transcriptions);
  } catch (error) {
    console.error("Error fetching transcriptions:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch transcriptions",
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
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json(
        { error: "VideoId is required" },
        { status: 400 }
      );
    }

    const result = await Transcription.deleteOne({ videoId, userId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Transcription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting transcription:", error);
    return NextResponse.json(
      {
        error: "Failed to delete transcription",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
