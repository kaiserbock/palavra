import { useEffect } from "react";
import type { Selection } from "./useTextSelection";

interface UseScrollHandlerProps {
  selection: Selection | null;
  onClearSelection: () => void;
}

export function useScrollHandler({
  selection,
  onClearSelection,
}: UseScrollHandlerProps) {
  useEffect(() => {
    const handleScroll = () => {
      if (selection) {
        onClearSelection();
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [selection, onClearSelection]);
}
