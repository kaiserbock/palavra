import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BookOpen } from "lucide-react";
import { useSavedTerms } from "@/contexts/SavedTermsContext";
import { generateTermsList } from "@/lib/utils";
import type { Term } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsDrawerProps {
  transcript: string;
}

export function TermsDrawer({ transcript }: TermsDrawerProps) {
  const { savedTerms } = useSavedTerms();
  const result = generateTermsList(transcript, savedTerms, true);
  const terms = "terms" in result ? result.terms : result;
  const termsCount = terms.length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <BookOpen className="h-4 w-4" />
          {termsCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-[10px] text-primary-foreground w-4 h-4 flex items-center justify-center rounded-full">
              {termsCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="p-0 w-full sm:w-[400px]">
        <SheetHeader className="px-4 sm:px-6 py-4 border-b">
          <SheetTitle className="text-base sm:text-lg">
            Terms in Transcription
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100%-65px)]">
          <div className="p-4 sm:p-6">
            {termsCount > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {termsCount} {termsCount === 1 ? "term" : "terms"} found
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {terms.map((term: Term) => (
                    <div
                      key={term.text}
                      className="flex flex-col p-3 rounded-lg bg-secondary/50 text-secondary-foreground hover:bg-secondary/70 transition-colors"
                    >
                      <span className="text-sm font-medium mb-1">
                        {term.text}
                      </span>
                      {term.translation && (
                        <span className="text-xs text-muted-foreground">
                          {term.translation}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  No terms found
                </p>
                <p className="text-xs text-muted-foreground/60 max-w-[200px]">
                  No saved terms were found in this transcription.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
