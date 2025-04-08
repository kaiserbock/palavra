import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Transcription from "@/models/Transcription";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";

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

    console.log("Attempting to connect to MongoDB...");
    await connectToDatabase();
    console.log("Successfully connected to MongoDB");

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
      { error: "Failed to save transcription" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    console.log("Starting GET request for transcriptions...");
    const session = (await getServerSession(authOptions)) as Session | null;
    const userId = session?.user?.id;

    if (!userId) {
      console.log("No user ID found in session");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log("User authenticated, connecting to MongoDB...");
    await connectToDatabase();
    console.log("Successfully connected to MongoDB");

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    if (videoId) {
      console.log(`Fetching transcription for videoId: ${videoId}`);
      const transcription = await Transcription.findOne({ videoId, userId });
      if (!transcription) {
        console.log("Transcription not found");
        return NextResponse.json(
          { error: "Transcription not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(transcription);
    }

    console.log("Fetching all transcriptions for user");
    const transcriptions = await Transcription.find({ userId }).sort({
      createdAt: -1,
    });
    console.log(`Found ${transcriptions.length} transcriptions`);
    return NextResponse.json(transcriptions);
  } catch (error) {
    console.error("Error fetching transcriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transcriptions" },
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
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json(
        { error: "VideoId is required" },
        { status: 400 }
      );
    }

    await Transcription.deleteOne({ videoId, userId });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting transcription:", error);
    return NextResponse.json(
      { error: "Failed to delete transcription" },
      { status: 500 }
    );
  }
}
