import { LANGUAGE_NAMES } from "@/constants/languages";
import type { SavedTerm } from "@/contexts/SavedTermsContext";
import { BaseCard } from "../common/BaseCard";

interface TermCardProps {
  term: SavedTerm;
  onTermClick: (term: SavedTerm) => void;
  onRemove: (text: string, language: string) => Promise<void>;
}

export function TermCard({ term, onTermClick, onRemove }: TermCardProps) {
  return (
    <BaseCard
      title={term.text}
      language={LANGUAGE_NAMES[term.language]}
      category={term.category}
      onCardClick={() => onTermClick(term)}
      onRemove={() => onRemove(term.text, term.language)}
    />
  );
}
