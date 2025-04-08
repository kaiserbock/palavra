import { YoutubeTranscript } from "youtube-transcript";
import { NextResponse } from "next/server";

async function getVideoTitle(videoId: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${videoId}&format=json`
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.title || null;
  } catch (error) {
    console.error("Error fetching video title:", error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { url, language } = await request.json();

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
      const [transcript, title] = await Promise.all([
        YoutubeTranscript.fetchTranscript(videoId, {
          lang: language,
        }),
        getVideoTitle(videoId),
      ]);

      // Combine all transcript parts into a single text
      const fullTranscript = transcript.map((part) => part.text).join(" ");

      return NextResponse.json({ transcript: fullTranscript, title });
    } catch (error) {
      if (error instanceof Error) {
        // If the error contains available languages, return them
        const availableLanguagesMatch = error.message.match(
          /Available languages: (.+?)(?:\n|$)/
        );

        if (availableLanguagesMatch) {
          const availableLanguages = availableLanguagesMatch[1]
            .split(/,\s*/)
            .map((lang) => lang.trim())
            .filter(Boolean);

          return NextResponse.json(
            {
              error: "Language not available",
              availableLanguages,
              defaultLanguage: availableLanguages[0],
            },
            { status: 400 }
          );
        }
      }
      throw error;
    }
  } catch (error) {
    console.error("Error fetching transcript:", error);
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
