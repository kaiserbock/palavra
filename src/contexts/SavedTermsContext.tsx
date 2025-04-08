"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface TermResponse {
  _id: string;
  text: string;
  language: string;
  translation?: string;
  category?: WordCategory;
  createdAt: string;
}

export type WordCategory = "verb" | "adjective" | "noun" | "sentence" | "other";

export interface SavedTerm {
  text: string;
  language: string;
  translation?: string;
  category?: WordCategory;
  createdAt: number;
}

interface SavedTermsContextType {
  savedTerms: SavedTerm[];
  addTerm: (
    text: string,
    language: string,
    translation?: string
  ) => Promise<void>;
  removeTerm: (text: string, language: string) => Promise<void>;
  hasTerm: (text: string, language: string) => boolean;
  updateTermTranslation: (
    text: string,
    language: string,
    translation: string
  ) => void;
  clearTerms: () => void;
}

const SavedTermsContext = createContext<SavedTermsContextType | undefined>(
  undefined
);

export function SavedTermsProvider({ children }: { children: ReactNode }) {
  const [savedTerms, setSavedTerms] = useState<SavedTerm[]>([]);
  const { data: session } = useSession();

  const clearTerms = useCallback(() => {
    setSavedTerms([]);
  }, []);

  // Load saved terms on mount and when session changes
  useEffect(() => {
    const loadTerms = async () => {
      if (!session) {
        setSavedTerms([]);
        return;
      }

      try {
        const response = await fetch("/api/terms");
        if (!response.ok) {
          if (response.status === 401) {
            // User is not authenticated, this is expected
            setSavedTerms([]);
            return;
          }
          throw new Error("Failed to load terms");
        }
        const terms = await response.json();
        setSavedTerms(
          terms.map((term: TermResponse) => ({
            text: term.text,
            language: term.language,
            translation: term.translation,
            category: term.category,
            createdAt: new Date(term.createdAt).getTime(),
          }))
        );
      } catch (error) {
        console.error("Error loading terms:", error);
        toast.error("Failed to load saved terms");
      }
    };

    loadTerms();
  }, [session]);

  const addTerm = useCallback(
    async (text: string, language: string, translation?: string) => {
      if (!session) {
        toast.error("Please log in to save terms");
        return;
      }

      // Check if the term has more than one word
      const wordCount = text.trim().split(/\s+/).length;
      let category: WordCategory = wordCount > 1 ? "sentence" : "other";

      // Only analyze single words
      if (wordCount === 1) {
        try {
          const response = await fetch("/api/analyze-word", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text,
              language,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            category = data.category;
          }
        } catch (error) {
          console.error("Error analyzing word:", error);
        }
      }

      try {
        const response = await fetch("/api/terms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            language,
            translation,
            category,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save term");
        }

        const newTerm = await response.json();
        setSavedTerms((prev) => [
          ...prev,
          {
            text: newTerm.text,
            language: newTerm.language,
            translation: newTerm.translation,
            category: newTerm.category,
            createdAt: new Date(newTerm.createdAt).getTime(),
          },
        ]);
      } catch (error) {
        console.error("Error saving term:", error);
        toast.error("Failed to save term");
      }
    },
    [session]
  );

  const removeTerm = useCallback(
    async (text: string, language: string) => {
      if (!session) {
        toast.error("Please log in to remove terms");
        return;
      }

      try {
        const response = await fetch(
          `/api/terms?text=${encodeURIComponent(
            text
          )}&language=${encodeURIComponent(language)}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete term");
        }

        setSavedTerms((prev) =>
          prev.filter(
            (term) => term.text !== text || term.language !== language
          )
        );
      } catch (error) {
        console.error("Error deleting term:", error);
        toast.error("Failed to delete term");
      }
    },
    [session]
  );

  const hasTerm = useCallback(
    (text: string, language: string) => {
      return savedTerms.some(
        (term) => term.text === text && term.language === language
      );
    },
    [savedTerms]
  );

  const updateTermTranslation = useCallback(
    async (text: string, language: string, translation: string) => {
      if (!session) {
        toast.error("Please log in to update terms");
        return;
      }

      try {
        const response = await fetch("/api/terms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            language,
            translation,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update translation");
        }

        setSavedTerms((prev) =>
          prev.map((term) =>
            term.text === text && term.language === language
              ? { ...term, translation }
              : term
          )
        );

        toast.success("Translation updated successfully");
      } catch (error) {
        console.error("Error updating translation:", error);
        toast.error("Failed to update translation");
      }
    },
    [session]
  );

  return (
    <SavedTermsContext.Provider
      value={{
        savedTerms,
        addTerm,
        removeTerm,
        hasTerm,
        updateTermTranslation,
        clearTerms,
      }}
    >
      {children}
    </SavedTermsContext.Provider>
  );
}

export function useSavedTerms() {
  const context = useContext(SavedTermsContext);
  if (context === undefined) {
    throw new Error("useSavedTerms must be used within a SavedTermsProvider");
  }
  return context;
}
