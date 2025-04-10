import { useState, useCallback, useRef } from "react";
import { WordCategory } from "@/contexts/SavedTermsContext";
import { useTextSelection } from "./useTextSelection";

interface SelectedTerm {
  text: string;
  translation?: string;
  category?: WordCategory;
  position: { x: number; y: number };
  placement: "top" | "bottom";
}

export function useTermSelection(onClearSelection?: () => void) {
  const [selectedTerm, setSelectedTerm] = useState<SelectedTerm | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { clearSelection: clearTextSelection } = useTextSelection({
    containerRef,
  });

  // Helper function to handle the optional onClearSelection callback
  const handleClearSelection = useCallback(() => {
    if (onClearSelection) {
      onClearSelection();
    }
  }, [onClearSelection]);

  const handleTermClick = useCallback(
    (
      event: React.MouseEvent,
      text: string,
      position: { x: number; y: number },
      placement: "top" | "bottom",
      translation?: string,
      category?: WordCategory
    ) => {
      event.preventDefault();
      event.stopPropagation();

      handleClearSelection();

      // Toggle selection off if clicking the same term
      if (selectedTerm?.text === text) {
        setSelectedTerm(null);
        return;
      }

      setSelectedTerm({ text, translation, category, position, placement });
    },
    [selectedTerm, handleClearSelection]
  );

  const clearSelection = useCallback(() => {
    handleClearSelection();
    clearTextSelection();
    setSelectedTerm(null);
  }, [handleClearSelection, clearTextSelection]);

  return {
    selectedTerm,
    handleTermClick,
    clearSelection,
    containerRef,
  };
}
