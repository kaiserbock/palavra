import { useCallback, useState } from "react";

export interface Selection {
  text: string;
  range: Range | null;
  position: { start: number; end: number } | null;
}

interface UseTextSelectionProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

interface TextNodeInfo {
  node: Text;
  start: number;
  end: number;
}

// Regex patterns for text boundaries
const PHRASE_BOUNDARY_REGEX = /[.!?。！？\n\r]/;
const WORD_BOUNDARY_REGEX =
  /[\s,.!?;:'"()[\]{}<>。！？、，；：""''「」『』（）［］｛｝]/;

// Pure function to collect all text nodes and their offsets
function collectTextNodes(container: HTMLDivElement): {
  textNodes: Text[];
  nodeOffsets: TextNodeInfo[];
  fullText: string;
} {
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null
  );

  let node: Text | null = walker.firstChild() as Text;
  while (node) {
    textNodes.push(node);
    node = walker.nextNode() as Text;
  }

  // Combine all text content
  let fullText = "";
  const nodeOffsets: TextNodeInfo[] = [];
  let currentOffset = 0;

  textNodes.forEach((node) => {
    const text = node.textContent || "";
    nodeOffsets.push({
      node,
      start: currentOffset,
      end: currentOffset + text.length,
    });
    fullText += text;
    currentOffset += text.length;
  });

  return { textNodes, nodeOffsets, fullText };
}

// Pure function to find text boundaries (word or phrase)
function findBoundaries(
  text: string,
  startPos: number,
  boundaryRegex: RegExp,
  isPhraseLevel: boolean = false
): { startOffset: number; endOffset: number } {
  let startOffset = startPos;
  let endOffset = startPos;

  // Find start of text unit
  for (let i = startPos; i > 0; i--) {
    if (boundaryRegex.test(text[i - 1])) {
      startOffset = i;
      break;
    }
    startOffset = i - 1;
  }

  // Find end of text unit
  for (let i = startPos; i < text.length; i++) {
    if (boundaryRegex.test(text[i])) {
      endOffset = i + (isPhraseLevel ? 1 : 0); // Include punctuation for phrases
      break;
    }
    endOffset = i + 1;
  }

  return { startOffset, endOffset };
}

// Pure function to calculate absolute position in content
function calculateAbsolutePosition(
  range: Range,
  container: HTMLDivElement
): number {
  const preSelectionRange = range.cloneRange();
  preSelectionRange.selectNodeContents(container);
  preSelectionRange.setEnd(range.startContainer, range.startOffset);
  return preSelectionRange.toString().length;
}

export function useTextSelection({ containerRef }: UseTextSelectionProps) {
  const [selection, setSelection] = useState<Selection | null>(null);

  // Helper function to apply a selection and update state
  const applySelection = useCallback(
    (range: Range, selectedText: string, startPos: number, endPos: number) => {
      const sel = window.getSelection();
      if (!sel) return;

      sel.removeAllRanges();
      sel.addRange(range);

      setSelection({
        text: selectedText,
        range,
        position: {
          start: startPos,
          end: endPos,
        },
      });
    },
    []
  );

  const selectPhrase = useCallback(
    (event: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      // Collect text nodes and their information
      const { nodeOffsets, fullText } = collectTextNodes(container);

      // Get the click position
      const range = document.caretRangeFromPoint(event.clientX, event.clientY);
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

      // Create the range
      const newRange = document.createRange();
      newRange.setStart(startNodeInfo.node, startOffset - startNodeInfo.start);
      newRange.setEnd(endNodeInfo.node, endOffset - endNodeInfo.start);

      // Apply the selection
      applySelection(newRange, selectedPhrase, startOffset, endOffset);
    },
    [containerRef, applySelection]
  );

  const selectWord = useCallback(
    (event: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      // Get the click position
      const range = document.caretRangeFromPoint(event.clientX, event.clientY);
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

      // Create the range
      const newRange = document.createRange();
      newRange.setStart(textNode, startOffset);
      newRange.setEnd(textNode, endOffset);

      // Calculate absolute position
      const start = calculateAbsolutePosition(newRange, container);

      // Apply the selection
      applySelection(
        newRange,
        selectedWord,
        start,
        start + selectedWord.length
      );
    },
    [containerRef, applySelection]
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

      // Apply the selection
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
