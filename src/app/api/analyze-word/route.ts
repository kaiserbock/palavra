import { NextResponse } from "next/server";
import type { WordCategory } from "@/contexts/SavedTermsContext";

const GERMAN_VERB_ENDINGS = [
  "en",
  "eln",
  "ern",
  "ieren",
  "eln",
  "ern",
  "zen",
  "ssen",
  "chen",
  "gen",
  "ken",
  "men",
  "nen",
  "ten",
];

const GERMAN_ADJECTIVE_ENDINGS = [
  "ig",
  "lich",
  "isch",
  "bar",
  "sam",
  "haft",
  "los",
  "voll",
  "reich",
  "arm",
  "wert",
  "würdig",
  "mäßig",
  "fähig",
  "artig",
];

const GERMAN_NOUN_ENDINGS = [
  "ung",
  "heit",
  "keit",
  "schaft",
  "tum",
  "chen",
  "lein",
  "nis",
  "sal",
  "tel",
  "ion",
  "tät",
  "ur",
  "ik",
  "ei",
];

export async function POST(request: Request) {
  try {
    const { text, language } = await request.json();
    const word = text.trim();

    if (!word) {
      return NextResponse.json({ category: "other" });
    }

    // Handle English words
    if (language === "en") {
      try {
        // Try using Wiktionary API for English
        const response = await fetch(
          `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(
            word.toLowerCase()
          )}`
        );

        if (response.ok) {
          const data = await response.json();
          let category: WordCategory = "other";

          try {
            const definition = data.en[0];
            if (definition.partOfSpeech) {
              const pos = definition.partOfSpeech.toLowerCase();
              if (pos.includes("verb")) {
                category = "verb";
              } else if (pos.includes("adjective")) {
                category = "adjective";
              } else if (pos.includes("noun")) {
                category = "noun";
              }
            }
            return NextResponse.json({ category });
          } catch (error) {
            console.error("Error parsing English Wiktionary response:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching English definition:", error);
      }

      // Fallback: Use English word patterns
      const lowercaseWord = word.toLowerCase();

      // Common verb patterns
      if (
        lowercaseWord.endsWith("ing") ||
        lowercaseWord.endsWith("ed") ||
        lowercaseWord.endsWith("ate") ||
        lowercaseWord.endsWith("ify") ||
        lowercaseWord.endsWith("ize") ||
        lowercaseWord.endsWith("ise")
      ) {
        return NextResponse.json({ category: "verb" });
      }

      // Common adjective patterns
      if (
        lowercaseWord.endsWith("able") ||
        lowercaseWord.endsWith("ible") ||
        lowercaseWord.endsWith("al") ||
        lowercaseWord.endsWith("ful") ||
        lowercaseWord.endsWith("ic") ||
        lowercaseWord.endsWith("ive") ||
        lowercaseWord.endsWith("less") ||
        lowercaseWord.endsWith("ous")
      ) {
        return NextResponse.json({ category: "adjective" });
      }

      // Common noun patterns
      if (
        lowercaseWord.endsWith("tion") ||
        lowercaseWord.endsWith("sion") ||
        lowercaseWord.endsWith("ness") ||
        lowercaseWord.endsWith("ment") ||
        lowercaseWord.endsWith("ity") ||
        lowercaseWord.endsWith("ance") ||
        lowercaseWord.endsWith("ence") ||
        lowercaseWord.endsWith("ship") ||
        lowercaseWord.endsWith("dom") ||
        lowercaseWord.endsWith("ism")
      ) {
        return NextResponse.json({ category: "noun" });
      }
    }

    // Handle German words
    if (language === "de") {
      try {
        // Try using German Wiktionary first
        const response = await fetch(
          `https://de.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(
            word
          )}`
        );

        if (response.ok) {
          const data = await response.json();
          let category: WordCategory = "other";

          try {
            const definition = data.de[0];
            if (definition.partOfSpeech) {
              if (definition.partOfSpeech.includes("Verb")) {
                category = "verb";
              } else if (definition.partOfSpeech.includes("Adjektiv")) {
                category = "adjective";
              } else if (definition.partOfSpeech.includes("Substantiv")) {
                category = "noun";
              }
            }
            return NextResponse.json({ category });
          } catch (error) {
            console.error("Error parsing German Wiktionary response:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching German definition:", error);
      }

      // Fallback: Use enhanced German word patterns
      const lowercaseWord = word.toLowerCase();

      // Check if it's a compound word (common in German)
      if (word.length > 10 && word[0] === word[0].toUpperCase()) {
        return NextResponse.json({ category: "noun" });
      }

      // Check verb patterns
      if (
        GERMAN_VERB_ENDINGS.some((ending) => lowercaseWord.endsWith(ending))
      ) {
        return NextResponse.json({ category: "verb" });
      }

      // Check adjective patterns
      if (
        GERMAN_ADJECTIVE_ENDINGS.some((ending) =>
          lowercaseWord.endsWith(ending)
        )
      ) {
        return NextResponse.json({ category: "adjective" });
      }

      // Check noun patterns
      if (
        // Capitalized words in German are typically nouns
        word[0] === word[0].toUpperCase() ||
        // Check common noun endings
        GERMAN_NOUN_ENDINGS.some((ending) => lowercaseWord.endsWith(ending))
      ) {
        return NextResponse.json({ category: "noun" });
      }
    }

    // If no pattern matched, return "other"
    return NextResponse.json({ category: "other" });
  } catch (error) {
    console.error("Error analyzing word:", error);
    return NextResponse.json({ category: "other" });
  }
}
