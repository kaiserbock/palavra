import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { LANGUAGE_NAMES } from "@/constants/languages";
import type { SavedTerm } from "@/contexts/SavedTermsContext";

interface TermCardProps {
  term: SavedTerm;
  onTermClick: (term: SavedTerm) => void;
  onRemove: (text: string, language: string) => Promise<void>;
}

export function TermCard({ term, onTermClick, onRemove }: TermCardProps) {
  return (
    <div
      onClick={() => onTermClick(term)}
      className="group relative p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none truncate">
              {term.text}
            </p>
            {term.translation && (
              <p className="text-xs text-muted-foreground leading-tight truncate">
                {term.translation}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center text-[10px] font-medium leading-none px-2 py-0.5 rounded-full bg-secondary/50 text-secondary-foreground">
              {LANGUAGE_NAMES[term.language]}
            </span>
            {term.category && (
              <span className="inline-flex items-center text-[10px] font-medium leading-none px-2 py-0.5 rounded-full bg-primary/10 text-primary/70">
                {term.category}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(term.text, term.language);
          }}
          className="h-6 w-6 shrink-0 bg-transparent hover:bg-transparent text-muted-foreground hover:text-destructive focus:text-destructive opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
