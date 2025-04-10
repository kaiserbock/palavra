import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import CustomText from "@/models/CustomText";
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
    const text = await CustomText.findOne({
      _id: id,
      userId: session.user.id,
    }).lean();

    if (!text) {
      return NextResponse.json(
        { error: "Custom text not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(text);
  } catch (error) {
    console.error("[CUSTOM_TEXT_GET]", error);
    return NextResponse.json(
      {
        error: "Failed to fetch custom text",
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
    const { name, content, language } = body;

    if (name && name.length > 255) {
      return NextResponse.json({ error: "Name is too long" }, { status: 400 });
    }

    if (content && content.length > 10000) {
      return NextResponse.json(
        { error: "Content is too long" },
        { status: 400 }
      );
    }

    await getDbConnection();
    const text = await CustomText.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      {
        ...(name && { name }),
        ...(content && { content }),
        ...(language && { language }),
      },
      { new: true }
    ).lean();

    if (!text) {
      return NextResponse.json(
        { error: "Custom text not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(text);
  } catch (error) {
    console.error("[CUSTOM_TEXT_PATCH]", error);
    return NextResponse.json(
      {
        error: "Failed to update custom text",
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
    const text = await CustomText.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    }).lean();

    if (!text) {
      return NextResponse.json(
        { error: "Custom text not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(text);
  } catch (error) {
    console.error("[CUSTOM_TEXT_DELETE]", error);
    return NextResponse.json(
      {
        error: "Failed to delete custom text",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
