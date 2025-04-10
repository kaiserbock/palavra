import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Transcription from "@/models/Transcription";
import { connectToDatabase } from "@/lib/mongodb";
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

export async function GET(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const id = request.url.split("/").pop();
    if (!id) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await getDbConnection();
    const transcription = await Transcription.findOne({
      _id: id,
      userId: session.user.id,
    }).lean();

    if (!transcription) {
      return NextResponse.json(
        { error: "Transcription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(transcription);
  } catch (error) {
    console.error("[TRANSCRIPTION_GET]", error);
    return NextResponse.json(
      {
        error: "Failed to fetch transcription",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const id = request.url.split("/").pop();
    if (!id) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const { name, title, language, transcript } = body;

    if (name && name.length > 255) {
      return NextResponse.json({ error: "Name is too long" }, { status: 400 });
    }

    await getDbConnection();
    const transcription = await Transcription.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      {
        ...(name && { name }),
        ...(title && { title }),
        ...(language && { language }),
        ...(transcript && { transcript }),
      },
      { new: true }
    ).lean();

    if (!transcription) {
      return NextResponse.json(
        { error: "Transcription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(transcription);
  } catch (error) {
    console.error("[TRANSCRIPTION_PATCH]", error);
    return NextResponse.json(
      {
        error: "Failed to update transcription",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const id = request.url.split("/").pop();
    if (!id) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await getDbConnection();
    const transcription = await Transcription.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    }).lean();

    if (!transcription) {
      return NextResponse.json(
        { error: "Transcription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(transcription);
  } catch (error) {
    console.error("[TRANSCRIPTION_DELETE]", error);
    return NextResponse.json(
      {
        error: "Failed to delete transcription",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
