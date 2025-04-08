import { YoutubeTranscript } from "youtube-transcript";
import { NextResponse } from "next/server";

function extractVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Extract video ID from URL
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    try {
      // Try to get transcript without language to trigger the error with available languages
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      // If we get here, check the language of the first part
      const defaultLanguage = transcript[0]?.lang || "en";

      return NextResponse.json({
        availableLanguages: [defaultLanguage],
        defaultLanguage,
      });
    } catch (error) {
      if (error instanceof Error) {
        const availableLanguagesMatch = error.message.match(
          /Available languages: (.+?)(?:\n|$)/
        );

        if (availableLanguagesMatch) {
          const availableLanguages = availableLanguagesMatch[1]
            .split(/,\s*/)
            .map((lang) => lang.trim())
            .filter(Boolean);

          return NextResponse.json({
            availableLanguages,
            defaultLanguage: availableLanguages[0],
          });
        }
      }
      throw error;
    }
  } catch (error) {
    console.error("Error checking available languages:", error);
    return NextResponse.json(
      { error: "Failed to check available languages" },
      { status: 500 }
    );
  }
}
