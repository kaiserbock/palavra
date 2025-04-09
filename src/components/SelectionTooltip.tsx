"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Type, Loader2 } from "lucide-react";
import { useSavedTerms } from "@/contexts/SavedTermsContext";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";

interface SelectionTooltipProps {
  selection: {
    text: string;
    range: Range | null;
    position: { start: number; end: number } | null;
  };
  language?: string;
  onSelectionChange?: (
    selection: {
      text: string;
      range: Range;
      position: { start: number; end: number };
    } | null
  ) => void;
}

export function SelectionTooltip({
  selection,
  language,
  onSelectionChange,
}: SelectionTooltipProps) {
  const { addTerm, hasTerm } = useSavedTerms();
  const { user } = useUser();
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null
  );
  const [isMounted, setIsMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      document.body.style.userSelect = "";
    };
  }, []);

  const updatePosition = useCallback(
    (range: Range) => {
      if (!isMounted) return;

      const rect = range.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;

      // Position the tooltip centered over the selection
      const x = rect.left + rect.width / 2;
      const y = rect.bottom + scrollY + 8; // 8px gap below the text

      setPosition({ x, y });
    },
    [isMounted]
  );

  const handleSaveTerm = useCallback(async () => {
    if (!isMounted || !selection.text || !selection.position || isSaving)
      return;

    const termLanguage = language || user?.learningLanguage || "en";

    // Check if term already exists
    if (hasTerm(selection.text, termLanguage)) {
      toast.error("Term already exists");
      return;
    }

    setIsSaving(true);
    document.body.style.userSelect = "none";

    try {
      // If the term is not in English, get its translation first
      let translation: string | undefined;
      if (termLanguage !== "en") {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: selection.text,
            fromLanguage: termLanguage,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to translate term");
        }

        const data = await response.json();
        translation = data.translation;
      }

      // Save the term with its translation
      await addTerm(selection.text, termLanguage, translation);

      toast.success("Term saved successfully");

      // Only clear selection and position after success
      if (typeof window !== "undefined") {
        window.getSelection()?.removeAllRanges();
      }
      onSelectionChange?.(null);
    } catch (error) {
      console.error("Error saving term:", error);
      toast.error("Failed to save term");
    } finally {
      setIsSaving(false);
      document.body.style.userSelect = "";
    }
  }, [
    selection,
    language,
    user?.learningLanguage,
    addTerm,
    hasTerm,
    isMounted,
    onSelectionChange,
    isSaving,
  ]);

  useEffect(() => {
    if (isMounted && selection.range && !isSaving) {
      updatePosition(selection.range);
    } else if (!selection.range) {
      setPosition(null);
    }
  }, [selection.range, updatePosition, isMounted, isSaving]);

  if (!isMounted || !position) return null;

  return (
    <div
      className="fixed z-50 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-1.5"
      style={{
        left: `${position.x}px`,
        top: position.y,
        transform: "translateX(-50%)", // Center the tooltip
      }}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={handleSaveTerm}
        disabled={isSaving}
        className="flex items-center justify-center gap-1.5 w-[120px] h-8 px-3 text-sm font-medium"
      >
        {isSaving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Type className="h-3.5 w-3.5" />
        )}
        <span>{isSaving ? "Saving..." : "Save Term"}</span>
      </Button>
    </div>
  );
}
