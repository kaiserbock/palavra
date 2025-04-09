"use client";

import { useState } from "react";
import { useSavedTerms } from "@/contexts/SavedTermsContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, Languages, SortAsc } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTermsFiltering } from "@/hooks/useTermsFiltering";
import { useTermTranslation } from "@/hooks/useTermTranslation";
import { TermCard } from "./terms/TermCard";
import { TermDialog } from "./terms/TermDialog";
import { LANGUAGE_NAMES } from "@/constants/languages";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { savedTerms, removeTerm, updateTermTranslation } = useSavedTerms();
  const [searchQuery, setSearchQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("newest");

  const { availableLanguages, filteredTerms } = useTermsFiltering({
    terms: savedTerms,
    searchQuery,
    languageFilter,
    sortOrder,
  });

  const { selectedTerm, setSelectedTerm, isTranslating, handleTermClick } =
    useTermTranslation({
      updateTermTranslation,
    });

  if (savedTerms.length === 0) return null;

  return (
    <>
      <div className={cn("flex flex-col h-full", className)}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {filteredTerms.length}{" "}
                {filteredTerms.length === 1 ? "term" : "terms"} saved
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search terms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {availableLanguages.length > 1 && (
                <Select
                  value={languageFilter}
                  onValueChange={setLanguageFilter}
                >
                  <SelectTrigger className="w-full h-9">
                    <Languages className="h-4 w-4 mr-2 shrink-0" />
                    <SelectValue placeholder="Filter by language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    {availableLanguages.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {LANGUAGE_NAMES[lang]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-full sm:w-[140px] h-9">
                  <SortAsc className="h-4 w-4 mr-2 shrink-0" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="az">A to Z</SelectItem>
                  <SelectItem value="za">Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          {filteredTerms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                No terms found
              </p>
              <p className="text-xs text-muted-foreground/60 max-w-[200px]" />
            </div>
          ) : (
            <div className="divide-y">
              {filteredTerms.map((term) => (
                <TermCard
                  key={`${term.text}-${term.language}`}
                  term={term}
                  onTermClick={handleTermClick}
                  onRemove={removeTerm}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <TermDialog
        selectedTerm={selectedTerm}
        isTranslating={isTranslating}
        onOpenChange={() => setSelectedTerm(null)}
      />
    </>
  );
}
