import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SavedTerm } from "@/contexts/SavedTermsContext";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Term = {
  text: string;
  translation?: string;
  position?: { start: number; end: number };
};

type TermsResult = {
  terms: Term[];
  uniqueCount: number;
};

interface TooltipPosition {
  x: number;
  y: number;
  placement: "top" | "bottom";
}

export function generateTermsList(
  transcript: string,
  savedTerms: SavedTerm[],
  countUniqueOnly = false
): Term[] | TermsResult {
  const terms: Term[] = [];
  const uniqueTerms = new Set<string>();
  const processedTerms = new Set<string>(); // Track processed terms in lowercase

  savedTerms.forEach((term) => {
    // Skip if we've already processed this term (case-insensitive)
    const lowerTerm = term.text.toLowerCase();
    if (processedTerms.has(lowerTerm)) {
      return;
    }
    processedTerms.add(lowerTerm);

    const positions = findTermPositions(transcript, term.text);
    if (positions.length > 0) {
      uniqueTerms.add(lowerTerm);

      if (countUniqueOnly) {
        // For counting, just add one entry per term
        terms.push({
          text: term.text,
          translation: term.translation,
          position: positions[0],
        });
      } else {
        // For highlighting, add all occurrences
        positions.forEach((position) => {
          terms.push({
            text: term.text,
            translation: term.translation,
            position,
          });
        });
      }
    }
  });

  // Filter out terms that weren't found in the transcript
  const result = terms.filter((term) => term.position !== undefined);
  return countUniqueOnly
    ? { terms: result, uniqueCount: uniqueTerms.size }
    : result;
}

function findTermPositions(text: string, term: string) {
  const positions: { start: number; end: number }[] = [];
  const lowerText = text.toLowerCase();
  const lowerTerm = term.toLowerCase();

  // For multi-word terms, we need to handle spaces differently
  const escapedTerm = escapeRegExp(lowerTerm);
  // Match the term when it's:
  // 1. At the start of the text or preceded by a space/punctuation
  // 2. At the end of the text or followed by a space/punctuation
  const regex = new RegExp(
    `(?:^|[\\s.,!?;:'"()\\[\\]{}<>])${escapedTerm}(?=[\\s.,!?;:'"()\\[\\]{}<>]|$)`,
    "g"
  );

  let match;
  while ((match = regex.exec(lowerText)) !== null) {
    // Adjust the start position to exclude the preceding character (if any)
    const start = match[0].startsWith(lowerTerm)
      ? match.index
      : match.index + 1;
    positions.push({
      start,
      end: start + term.length,
    });
  }

  return positions;
}

// Helper function to escape special regex characters
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export function calculateTooltipPosition(
  targetRect: DOMRect,
  tooltipHeight: number,
  containerElement: HTMLElement | null
): TooltipPosition {
  const viewportHeight = window.innerHeight;
  const scrollY = window.scrollY || window.pageYOffset;
  const containerRect = containerElement?.getBoundingClientRect();

  if (!containerRect) return { x: 0, y: 0, placement: "bottom" };

  const spaceAbove = targetRect.top;
  const spaceBelow = viewportHeight - targetRect.bottom;

  const placement =
    spaceBelow >= tooltipHeight || spaceBelow > spaceAbove ? "bottom" : "top";

  const x = targetRect.left + targetRect.width / 2;
  const y =
    placement === "bottom"
      ? targetRect.bottom + scrollY + 8
      : targetRect.top + scrollY - tooltipHeight - 8;

  return { x, y, placement };
}

export function isAndroid() {
  if (typeof window === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}
