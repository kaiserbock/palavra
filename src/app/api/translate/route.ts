import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth/next";
import { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { User } from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  console.log("Translation request received");
  try {
    // Get user's native language
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { text, fromLanguage } = await request.json();
    const toLanguage = user.nativeLanguage;

    console.log("Translation request details:", {
      text,
      fromLanguage,
      toLanguage,
    });

    if (!text || !fromLanguage) {
      console.log("Missing required fields:", { text, fromLanguage });
      return NextResponse.json(
        { error: "Text and language are required" },
        { status: 400 }
      );
    }

    // If the text is already in the user's native language, return it as is
    if (fromLanguage === toLanguage) {
      console.log("Text already in native language");
      return NextResponse.json({ translation: text });
    }

    console.log("Attempting translation with OpenAI");
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a translator. Provide direct translations without any explanatory text. If there are multiple possible translations, separate them with a bullet point (•). Example output format: 'word' or 'first•second•third'",
        },
        {
          role: "user",
          content: `Translate this ${fromLanguage} text to ${toLanguage}: ${text}`,
        },
      ],
      temperature: 0.3,
    });

    const translation = completion.choices[0].message.content;
    console.log("Translation successful:", { original: text, translation });

    return NextResponse.json({ translation });
  } catch (error) {
    console.error("Translation error details:", error);
    return NextResponse.json(
      { error: "Failed to translate text" },
      { status: 500 }
    );
  }
}
