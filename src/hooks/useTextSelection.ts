import { useCallback, useState, useEffect } from "react";
import {
  PHRASE_BOUNDARY_REGEX,
  WORD_BOUNDARY_REGEX,
  collectTextNodes,
  findBoundaries,
  calculateAbsolutePosition,
  getTouchCoordinates,
  createAndApplySelection,
} from "@/lib/selectionUtils";

export interface Selection {
  text: string;
  range: Range | null;
  position: { start: number; end: number } | null;
}

interface UseTextSelectionProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function useTextSelection({ containerRef }: UseTextSelectionProps) {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const selectPhrase = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const container = containerRef.current;
      if (!container) return;

      // Collect text nodes and their information
      const { nodeOffsets, fullText } = collectTextNodes(container);

      // Get the click position
      const coords = "touches" in event ? getTouchCoordinates(event) : event;
      const range = document.caretRangeFromPoint(
        coords.clientX,
        coords.clientY
      );
      if (!range) return;

      // Find the global offset for the click position
      const clickedNode = range.startContainer as Text;
      const clickedNodeInfo = nodeOffsets.find(
        (info) => info.node === clickedNode
      );
      if (!clickedNodeInfo) return;

      const globalClickOffset = clickedNodeInfo.start + range.startOffset;

      // Find phrase boundaries
      const { startOffset, endOffset } = findBoundaries(
        fullText,
        globalClickOffset,
        PHRASE_BOUNDARY_REGEX,
        true
      );

      // Don't proceed if we're clicking on whitespace or empty area
      const selectedPhrase = fullText.slice(startOffset, endOffset).trim();
      if (!selectedPhrase) return;

      // Find the nodes and offsets for the selection
      const startNodeInfo = nodeOffsets.find(
        (info) => info.start <= startOffset && info.end > startOffset
      );
      const endNodeInfo = nodeOffsets.find(
        (info) => info.start <= endOffset && info.end >= endOffset
      );

      if (!startNodeInfo || !endNodeInfo) return;

      const result = createAndApplySelection(
        selectedPhrase,
        startNodeInfo.node,
        endNodeInfo.node,
        startOffset - startNodeInfo.start,
        endOffset - endNodeInfo.start,
        container
      );

      if (result) {
        setSelection({
          text: selectedPhrase,
          range: result.range,
          position: {
            start: result.start,
            end: result.end,
          },
        });
      }
    },
    [containerRef]
  );

  const selectWord = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const container = containerRef.current;
      if (!container) return;

      // Get the click position
      const coords = "touches" in event ? getTouchCoordinates(event) : event;
      const range = document.caretRangeFromPoint(
        coords.clientX,
        coords.clientY
      );
      if (!range || !container.contains(range.startContainer)) return;

      // Get the text node at the click position
      const textNode = range.startContainer;
      if (!(textNode instanceof Text)) return;

      const text = textNode.textContent || "";
      if (!text.trim()) return;

      const clickOffset = range.startOffset;

      // Find word boundaries
      const { startOffset, endOffset } = findBoundaries(
        text,
        clickOffset,
        WORD_BOUNDARY_REGEX
      );

      // Don't proceed if we're clicking on whitespace or empty area
      const selectedWord = text.slice(startOffset, endOffset).trim();
      if (!selectedWord) return;

      const result = createAndApplySelection(
        selectedWord,
        textNode,
        textNode,
        startOffset,
        endOffset,
        container
      );

      if (result) {
        setSelection({
          text: selectedWord,
          range: result.range,
          position: {
            start: result.start,
            end: result.end,
          },
        });
      }
    },
    [containerRef]
  );

  const selectText = useCallback(() => {
    const sel = window.getSelection();
    const container = containerRef.current;

    if (!sel || !container || sel.rangeCount === 0) {
      setSelection(null);
      return;
    }

    const range = sel.getRangeAt(0);
    const text = range.toString().trim();

    // Check if the selection is within our content container
    if (!container.contains(range.commonAncestorContainer)) {
      setSelection(null);
      return;
    }

    if (text) {
      const start = calculateAbsolutePosition(range, container);
      setSelection({
        text,
        range,
        position: {
          start,
          end: start + text.length,
        },
      });
    }
  }, [containerRef]);

  const handleSelectionStart = useCallback(
    (event: TouchEvent | MouseEvent) => {
      setIsSelecting(true);
      const container = containerRef.current;
      if (!container) return;

      const coords = "touches" in event ? getTouchCoordinates(event) : event;
      const range = document.caretRangeFromPoint(
        coords.clientX,
        coords.clientY
      );
      if (!range) return;

      // For mobile, we want to start with word selection
      if ("touches" in event) {
        const textNode = range.startContainer;
        if (!(textNode instanceof Text)) return;

        const text = textNode.textContent || "";
        if (!text.trim()) return;

        const clickOffset = range.startOffset;
        const { startOffset, endOffset } = findBoundaries(
          text,
          clickOffset,
          WORD_BOUNDARY_REGEX
        );

        const selectedWord = text.slice(startOffset, endOffset).trim();
        if (!selectedWord) return;

        const result = createAndApplySelection(
          selectedWord,
          textNode,
          textNode,
          startOffset,
          endOffset,
          container
        );

        if (result) {
          setSelection({
            text: selectedWord,
            range: result.range,
            position: {
              start: result.start,
              end: result.end,
            },
          });
        }
      }
    },
    [containerRef]
  );

  const handleSelectionMove = useCallback(
    (event: TouchEvent | MouseEvent) => {
      if (!isSelecting) return;
      const container = containerRef.current;
      if (!container) return;

      const coords = "touches" in event ? getTouchCoordinates(event) : event;
      const range = document.caretRangeFromPoint(
        coords.clientX,
        coords.clientY
      );
      if (!range) return;

      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;

      const currentRange = sel.getRangeAt(0);
      currentRange.setEnd(range.startContainer, range.startOffset);

      const text = currentRange.toString().trim();
      if (text) {
        const start = calculateAbsolutePosition(currentRange, container);
        setSelection({
          text,
          range: currentRange,
          position: {
            start,
            end: start + text.length,
          },
        });
      }
    },
    [containerRef, isSelecting]
  );

  const handleSelectionEnd = useCallback(() => {
    setIsSelecting(false);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Add both mouse and touch event listeners
    container.addEventListener("mousedown", handleSelectionStart);
    container.addEventListener("touchstart", handleSelectionStart);
    container.addEventListener("mousemove", handleSelectionMove);
    container.addEventListener("touchmove", handleSelectionMove);
    container.addEventListener("mouseup", handleSelectionEnd);
    container.addEventListener("touchend", handleSelectionEnd);
    container.addEventListener("mouseleave", handleSelectionEnd);

    return () => {
      container.removeEventListener("mousedown", handleSelectionStart);
      container.removeEventListener("touchstart", handleSelectionStart);
      container.removeEventListener("mousemove", handleSelectionMove);
      container.removeEventListener("touchmove", handleSelectionMove);
      container.removeEventListener("mouseup", handleSelectionEnd);
      container.removeEventListener("touchend", handleSelectionEnd);
      container.removeEventListener("mouseleave", handleSelectionEnd);
    };
  }, [
    containerRef,
    handleSelectionStart,
    handleSelectionMove,
    handleSelectionEnd,
  ]);

  const clearSelection = useCallback(() => {
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  return {
    selection,
    setSelection,
    selectPhrase,
    selectWord,
    selectText,
    clearSelection,
  };
}
