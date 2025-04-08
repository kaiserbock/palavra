import { YoutubeTranscript } from "youtube-transcript";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { url, lang } = await request.json();

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
      // Try to get transcript with requested language
      const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: lang || "en",
      });

      // Combine all transcript parts into one text
      const fullTranscript = transcript.map((part) => part.text).join(" ");

      return NextResponse.json({
        transcript: fullTranscript,
        language: transcript[0]?.lang || lang || "en",
      });
    } catch (error: unknown) {
      // Check if the error contains available languages
      if (error instanceof Error) {
        const availableLanguagesMatch = error.message.match(
          /Available languages: (.+)/
        );
        if (availableLanguagesMatch) {
          const availableLanguages = availableLanguagesMatch[1].split(", ");
          return NextResponse.json(
            {
              error: `No transcript available in ${lang.toUpperCase()}. Available languages: ${availableLanguages.join(
                ", "
              )}`,
              availableLanguages,
            },
            { status: 400 }
          );
        }
      }
      throw error;
    }
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Failed to get transcript" },
      { status: 500 }
    );
  }
}

function extractVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}
