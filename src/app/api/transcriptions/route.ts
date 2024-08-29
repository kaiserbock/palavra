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
    const body = await request.json();
    const { videoId, url, name, title, language, enhancedTranscript } = body;

    if (!videoId || !url || !language || !name || !enhancedTranscript) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // First check if a transcription already exists for this user and video
    const existingTranscription = await Transcription.findOne({
      videoId,
      userId,
    });

    if (existingTranscription) {
      return NextResponse.json(
        { error: "You have already saved this transcription" },
        { status: 409 }
      );
    }

    // Create a new transcription
    const newTranscription = await Transcription.create({
      videoId,
      url,
      name,
      title,
      language,
      transcript: enhancedTranscript,
      userId,
    });
    return NextResponse.json(newTranscription);
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

    await getDbConnection();
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    if (videoId) {
      // If videoId is provided, check if this specific transcription exists
      const transcription = await Transcription.findOne({
        videoId,
        userId,
      }).lean();
      return NextResponse.json({ exists: !!transcription });
    }

    // Otherwise, return all transcriptions
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

export async function PATCH(request: Request) {
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
    const body = await request.json();
    const { videoId, enhancedTranscript } = body;

    if (!videoId || !enhancedTranscript) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingTranscription = await Transcription.findOne({
      videoId,
      userId,
    });

    if (!existingTranscription) {
      return NextResponse.json(
        { error: "Transcription not found" },
        { status: 404 }
      );
    }

    const updatedTranscription = await Transcription.findOneAndUpdate(
      { videoId, userId },
      { transcript: enhancedTranscript },
      { new: true }
    );

    return NextResponse.json(updatedTranscription);
  } catch (error) {
    console.error("Error updating transcription:", error);
    return NextResponse.json(
      {
        error: "Failed to update transcription",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
