"use client";

import { useState, useEffect } from "react";
import { useSavedTerms } from "@/contexts/SavedTermsContext";
import { useFlashcardLists } from "@/contexts/FlashcardListsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Trash2 } from "lucide-react";
import { LANGUAGE_NAMES } from "@/constants/languages";

interface AddTermsToGroupProps {
  listId: string;
}

export function AddTermsToGroup({ listId }: AddTermsToGroupProps) {
  const { savedTerms } = useSavedTerms();
  const { lists, addTermToList, removeTermFromList } = useFlashcardLists();
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentList = lists.find((list) => list._id === listId);
  if (!currentList || !mounted) return null;

  const filteredTerms = savedTerms.filter((term) => {
    const isInList = currentList.termIds.includes(
      `${term.text}-${term.language}`
    );
    const matchesSearch = term.text
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return !isInList && matchesSearch;
  });

  const handleAddTerm = (termId: string) => {
    addTermToList(listId, termId);
  };

  const handleRemoveTerm = (termId: string) => {
    removeTermFromList(listId, termId);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search terms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Available Terms</h3>
          <div className="space-y-2">
            {filteredTerms.map((term) => (
              <div
                key={`${term.text}-${term.language}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-accent"
              >
                <div className="space-y-1">
                  <div className="font-medium">{term.text}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">
                      {LANGUAGE_NAMES[term.language]}
                    </span>
                    {term.category && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary/70">
                        {term.category}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleAddTerm(`${term.text}-${term.language}`)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {filteredTerms.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {searchQuery
                  ? "No terms found matching your search."
                  : "No terms available to add."}
              </p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Terms in Group</h3>
          <div className="space-y-2">
            {currentList.termIds.map((termId) => {
              const term = savedTerms.find(
                (t) => `${t.text}-${t.language}` === termId
              );
              if (!term) return null;

              return (
                <div
                  key={termId}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent"
                >
                  <div className="space-y-1">
                    <div className="font-medium">{term.text}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">
                        {LANGUAGE_NAMES[term.language]}
                      </span>
                      {term.category && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary/70">
                          {term.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveTerm(termId)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
            {currentList.termIds.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No terms in this group yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
