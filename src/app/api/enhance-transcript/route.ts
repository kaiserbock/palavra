import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const LANGUAGE_PROMPTS: Record<string, string> = {
  en: "Format and improve readability:",
  es: "Formato y mejora de legibilidad:",
  fr: "Format et amélioration de la lisibilité:",
  de: "Format und Verbesserung der Lesbarkeit:",
  it: "Formato e miglioramento della leggibilità:",
  pt: "Formato e melhoria da legibilidade:",
  ru: "Формат и улучшение читаемости:",
  ja: "フォーマットと読みやすさの向上:",
  ko: "형식 및 가독성 향상:",
  zh: "格式和可读性改进:",
};

export async function POST(request: Request) {
  try {
    const { transcript, language } = await request.json();

    if (!transcript || !language) {
      return NextResponse.json(
        { error: "Transcript and language are required" },
        { status: 400 }
      );
    }

    const prompt = `${LANGUAGE_PROMPTS[language]}\n\n${transcript}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You format and improve text readability by fixing punctuation, paragraphs, and spacing. Output only the improved text without any explanations or additional text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const enhancedTranscript = completion.choices[0].message.content;

    return NextResponse.json({ enhancedTranscript });
  } catch (error) {
    console.error("Error enhancing transcript:", error);
    return NextResponse.json(
      { error: "Failed to enhance transcript" },
      { status: 500 }
    );
  }
}
