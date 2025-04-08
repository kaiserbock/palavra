import { useState } from "react";
import { WordCategory } from "@/contexts/SavedTermsContext";

interface SelectedTerm {
  text: string;
  translation?: string;
  category?: WordCategory;
  position: { x: number; y: number };
  placement: "top" | "bottom";
}

export function useTermSelection(onClearSelection?: () => void) {
  const [selectedTerm, setSelectedTerm] = useState<SelectedTerm | null>(null);

  // Helper function to handle the optional onClearSelection callback
  const handleClearSelection = () => {
    if (onClearSelection) {
      onClearSelection();
    }
  };

  const handleTermClick = (
    event: React.MouseEvent,
    text: string,
    position: { x: number; y: number },
    placement: "top" | "bottom",
    translation?: string
  ) => {
    event.preventDefault();
    event.stopPropagation();

    handleClearSelection();

    // Toggle selection off if clicking the same term
    if (selectedTerm?.text === text) {
      setSelectedTerm(null);
      return;
    }

    setSelectedTerm({ text, translation, position, placement });
  };

  const clearSelection = () => {
    handleClearSelection();
    setSelectedTerm(null);
  };

  return {
    selectedTerm,
    handleTermClick,
    clearSelection,
  };
}
