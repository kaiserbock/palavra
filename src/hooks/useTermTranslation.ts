import { useState } from "react";
import type { SavedTerm, WordCategory } from "@/contexts/SavedTermsContext";

interface UseTermTranslationProps {
  updateTermTranslation: (
    text: string,
    language: string,
    translation: string
  ) => void;
}

export interface SelectedTerm {
  text: string;
  language: string;
  translation?: string;
  category?: WordCategory;
}

export function useTermTranslation({
  updateTermTranslation,
}: UseTermTranslationProps) {
  const [selectedTerm, setSelectedTerm] = useState<SelectedTerm | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTermClick = async (term: SavedTerm) => {
    if (term.language === "en") {
      setSelectedTerm({
        text: term.text,
        language: term.language,
        category: term.category,
      });
      return;
    }

    if (term.translation) {
      setSelectedTerm({
        text: term.text,
        language: term.language,
        translation: term.translation,
        category: term.category,
      });
      return;
    }

    setSelectedTerm({
      text: term.text,
      language: term.language,
      category: term.category,
    });
    setIsTranslating(true);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: term.text,
          fromLanguage: term.language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Translation failed");
      }

      updateTermTranslation(term.text, term.language, data.translation);

      setSelectedTerm((prev) =>
        prev ? { ...prev, translation: data.translation } : null
      );
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  return {
    selectedTerm,
    setSelectedTerm,
    isTranslating,
    handleTermClick,
  };
}
