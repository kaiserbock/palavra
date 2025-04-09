import { useState, useCallback, useEffect } from "react";
import { isAndroid } from "@/lib/utils";
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
  const [selectedText, setSelectedText] = useState<string>("");
  const [selectionStart, setSelectionStart] = useState<number>(0);
  const [selectionEnd, setSelectionEnd] = useState<number>(0);
  const [isSelecting, setIsSelecting] = useState(false);

  // Helper function to handle the optional onClearSelection callback
  const handleClearSelection = () => {
    if (onClearSelection) {
      onClearSelection();
    }
  };

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
    setSelectedTerm(null);
    setSelectedText("");
    setSelectionStart(0);
    setSelectionEnd(0);
    setIsSelecting(false);
  }, [handleClearSelection]);

  const selectWord = useCallback((text: string, start: number, end: number) => {
    if (isAndroid()) {
      // On Android, we need to handle the selection differently
      const range = document.createRange();
      const selection = window.getSelection();

      if (selection) {
        // Clear any existing selections
        selection.removeAllRanges();

        // Find the text node containing our target
        const textNode = document.evaluate(
          `//text()[contains(., '${text}')]`,
          document.body,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;

        if (textNode) {
          range.setStart(textNode, start);
          range.setEnd(textNode, end);
          selection.addRange(range);
        }
      }
    } else {
      // Original desktop behavior
      const range = document.createRange();
      const selection = window.getSelection();

      if (selection) {
        selection.removeAllRanges();
        range.setStart(document.body, start);
        range.setEnd(document.body, end);
        selection.addRange(range);
      }
    }

    setSelectedText(text);
    setSelectionStart(start);
    setSelectionEnd(end);
    setIsSelecting(true);
  }, []);

  const selectPhrase = useCallback(
    (text: string, start: number, end: number) => {
      if (isAndroid()) {
        // On Android, handle phrase selection with word boundaries
        const words = text.split(/\s+/);
        const firstWord = words[0];
        const lastWord = words[words.length - 1];

        const range = document.createRange();
        const selection = window.getSelection();

        if (selection) {
          selection.removeAllRanges();

          // Find the text nodes containing our target words
          const firstNode = document.evaluate(
            `//text()[contains(., '${firstWord}')]`,
            document.body,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          ).singleNodeValue;

          const lastNode = document.evaluate(
            `//text()[contains(., '${lastWord}')]`,
            document.body,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          ).singleNodeValue;

          if (firstNode && lastNode) {
            range.setStart(firstNode, start);
            range.setEnd(lastNode, end);
            selection.addRange(range);
          }
        }
      } else {
        // Original desktop behavior
        const range = document.createRange();
        const selection = window.getSelection();

        if (selection) {
          selection.removeAllRanges();
          range.setStart(document.body, start);
          range.setEnd(document.body, end);
          selection.addRange(range);
        }
      }

      setSelectedText(text);
      setSelectionStart(start);
      setSelectionEnd(end);
      setIsSelecting(true);
    },
    []
  );

  const selectText = useCallback((text: string, start: number, end: number) => {
    if (isAndroid()) {
      // On Android, handle text selection with touch events
      const range = document.createRange();
      const selection = window.getSelection();

      if (selection) {
        selection.removeAllRanges();

        // Find the text node containing our target
        const textNode = document.evaluate(
          `//text()[contains(., '${text}')]`,
          document.body,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;

        if (textNode) {
          range.setStart(textNode, start);
          range.setEnd(textNode, end);
          selection.addRange(range);
        }
      }
    } else {
      // Original desktop behavior
      const range = document.createRange();
      const selection = window.getSelection();

      if (selection) {
        selection.removeAllRanges();
        range.setStart(document.body, start);
        range.setEnd(document.body, end);
        selection.addRange(range);
      }
    }

    setSelectedText(text);
    setSelectionStart(start);
    setSelectionEnd(end);
    setIsSelecting(true);
  }, []);

  // Add touch event handling for Android
  useEffect(() => {
    if (isAndroid()) {
      const handleTouchStart = (e: TouchEvent) => {
        // Prevent default touch behavior to avoid text selection issues
        e.preventDefault();
      };

      const handleTouchMove = (e: TouchEvent) => {
        // Allow touch move for scrolling but prevent text selection
        if (e.touches.length === 1) {
          e.preventDefault();
        }
      };

      document.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });

      return () => {
        document.removeEventListener("touchstart", handleTouchStart);
        document.removeEventListener("touchmove", handleTouchMove);
      };
    }
  }, []);

  return {
    selectedTerm,
    handleTermClick,
    selectedText,
    selectionStart,
    selectionEnd,
    isSelecting,
    selectWord,
    selectPhrase,
    selectText,
    clearSelection,
  };
}
