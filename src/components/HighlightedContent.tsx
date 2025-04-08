import { useEffect, useRef } from "react";
import { generateTermsList, calculateTooltipPosition } from "@/lib/utils";
import { useSavedTerms } from "@/contexts/SavedTermsContext";
// import { useTooltipHandler } from "@/hooks/useTooltipHandler";
import { useTermSelection } from "@/hooks/useTermSelection";
import { TermTooltip } from "./terms/TermTooltip";
import { useTextSelection } from "@/hooks/useTextSelection";
import { SelectionTooltip } from "./SelectionTooltip";

interface HighlightedContentProps {
  content: string;
  language: string;
}

export function HighlightedContent({
  content,
  language,
}: // onSelectWord,
HighlightedContentProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { savedTerms } = useSavedTerms();

  console.log("savedTerms", savedTerms);

  const { selection, setSelection, selectPhrase, selectWord, selectText } =
    useTextSelection({ containerRef });

  const { selectedTerm, handleTermClick, clearSelection } = useTermSelection(
    () => setSelection(null)
  );

  // Handle clicks outside the container
  useEffect(() => {
    if (!selection) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setSelection(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selection, setSelection]);

  const handleDoubleClickCapture = (event: React.MouseEvent) => {
    console.log("here");
    event.preventDefault();
    event.stopPropagation();
    selectPhrase(event.nativeEvent);
  };

  const handleClick = (event: React.MouseEvent) => {
    console.log("here");
    const target = event.target as HTMLElement;
    const isHighlightedTerm = target.closest('[data-term="true"]');

    clearSelection();

    // Don't interfere with term clicks
    if (isHighlightedTerm) {
      return;
    }

    const sel = window.getSelection();
    const isTextSelected = sel && sel.toString().trim();

    if (target !== containerRef.current) {
      event.preventDefault();
      event.stopPropagation();
      if (isTextSelected) {
        selectText();
      } else {
        selectWord(event.nativeEvent);
      }
    }
  };

  const handleTermClickWithPosition = (
    event: React.MouseEvent,
    text: string,
    translation?: string
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const target = event.currentTarget as HTMLElement;
    targetRef.current = target;

    // Calculate initial position
    const targetRect = target.getBoundingClientRect();
    const tooltipHeight = tooltipRef.current?.offsetHeight || 32;
    const initialPosition = calculateTooltipPosition(
      targetRect,
      tooltipHeight,
      containerRef.current
    );

    handleTermClick(
      event,
      text,
      initialPosition,
      initialPosition.placement,
      translation
    );
  };

  // Generate the content with highlighted terms
  const result = generateTermsList(content, savedTerms, false);
  const terms = Array.isArray(result) ? result : result.terms;

  if (!content) return null;

  let lastIndex = 0;
  const elements: React.ReactNode[] = [];

  // Sort terms by start position to ensure correct order
  const sortedTerms = terms
    .filter(
      (term) =>
        term.position &&
        term.position.start >= 0 &&
        term.position.end <= content.length
    )
    .sort((a, b) => a.position!.start - b.position!.start);

  sortedTerms.forEach((term, index) => {
    if (!term.position) return;

    // Add text before the term
    if (term.position.start > lastIndex) {
      elements.push(
        <span key={`text-${index}`} className="select-text">
          {content.slice(lastIndex, term.position.start)}
        </span>
      );
    }

    // Add highlighted term
    elements.push(
      <span
        key={`term-${index}`}
        data-term="true"
        className="bg-yellow-100 rounded px-0.5 cursor-pointer hover:bg-yellow-200 transition-colors select-text"
        onClick={(e) =>
          handleTermClickWithPosition(e, term.text, term.translation)
        }
      >
        {content.slice(term.position.start, term.position.end)}
      </span>
    );

    lastIndex = term.position.end;
  });

  // Add remaining text
  if (lastIndex < content.length) {
    elements.push(
      <span key="text-end" className="select-text">
        {content.slice(lastIndex)}
      </span>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onClick={handleClick}
      onDoubleClickCapture={handleDoubleClickCapture}
    >
      {elements}
      {selectedTerm && (
        <TermTooltip
          tooltipRef={tooltipRef}
          text={selectedTerm.text}
          translation={selectedTerm.translation}
          category={selectedTerm.category}
          position={selectedTerm.position}
          placement={selectedTerm.placement}
        />
      )}
      {selection && (
        <SelectionTooltip
          selection={selection}
          language={language}
          onSelectionChange={setSelection}
        />
      )}
    </div>
  );
}
