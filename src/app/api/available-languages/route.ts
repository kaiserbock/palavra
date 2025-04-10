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

    // Clean the URL
    const cleanUrl = url.trim().replace(/^@/, "");

    // Extract video ID from URL
    const videoId = extractVideoId(cleanUrl);

    console.log("videoId", videoId);

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
        // Check for specific error messages from youtube-transcript
        if (error.message.includes("Transcript is disabled")) {
          return NextResponse.json(
            {
              error:
                "Transcripts are not available for this video. This might be due to:\n1. The video owner has disabled transcripts\n2. The video is age-restricted\n3. YouTube's regional restrictions",
            },
            { status: 400 }
          );
        }

        if (error.message.includes("Could not find automatic captions")) {
          return NextResponse.json(
            { error: "This video does not have any captions available." },
            { status: 400 }
          );
        }

        if (error.message.includes("Video is unavailable")) {
          return NextResponse.json(
            { error: "This video is unavailable or private." },
            { status: 400 }
          );
        }

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

        // Log the full error for debugging in production
        console.error("YouTube Transcript Error:", {
          message: error.message,
          videoId,
          stack: error.stack,
        });

        // If we get here, it's an unknown error from youtube-transcript
        return NextResponse.json(
          {
            error:
              "Unable to access video transcripts. If this video has captions and works locally, this might be due to YouTube's regional restrictions or rate limiting in the deployment environment.",
          },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Error checking available languages:", error);
    return NextResponse.json(
      { error: "Failed to check available languages. Please try again later." },
      { status: 500 }
    );
  }
}
