import { isAndroid } from "./utils";

// Regex patterns for text boundaries
export const PHRASE_BOUNDARY_REGEX = /[.!?。！？\n\r]/;
export const WORD_BOUNDARY_REGEX =
  /[\s,.!?;:'"()[\]{}<>。！？、，；：""''「」『』（）［］｛｝]/;

export interface TextNodeInfo {
  node: Text;
  start: number;
  end: number;
}

// Helper function to get touch coordinates
export function getTouchCoordinates(event: TouchEvent): {
  clientX: number;
  clientY: number;
} {
  const touch = event.touches[0] || event.changedTouches[0];
  return {
    clientX: touch.clientX,
    clientY: touch.clientY,
  };
}

// Pure function to collect all text nodes and their offsets
export function collectTextNodes(container: HTMLElement): {
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
export function findBoundaries(
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
export function calculateAbsolutePosition(
  range: Range,
  container: HTMLElement
): number {
  const preSelectionRange = range.cloneRange();
  preSelectionRange.selectNodeContents(container);
  preSelectionRange.setEnd(range.startContainer, range.startOffset);
  return preSelectionRange.toString().length;
}

// Helper function to create and apply a selection range
export function createAndApplySelection(
  text: string,
  startNode: Text,
  endNode: Text,
  startOffset: number,
  endOffset: number,
  container: HTMLElement
): { range: Range; start: number; end: number } | null {
  if (!text.trim()) return null;

  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);

  const start = calculateAbsolutePosition(range, container);
  const end = start + text.length;

  const sel = window.getSelection();
  if (sel) {
    sel.removeAllRanges();
    sel.addRange(range);
  }

  return { range, start, end };
}

// Helper function to handle Android-specific selection
export function handleAndroidSelection(
  text: string,
  start: number,
  end: number
): Range | null {
  if (!isAndroid()) return null;

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
      return range;
    }
  }

  return null;
}
