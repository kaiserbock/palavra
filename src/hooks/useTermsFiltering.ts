import { useMemo } from "react";
import type { SavedTerm } from "@/contexts/SavedTermsContext";

interface UseTermsFilteringProps {
  terms: SavedTerm[];
  searchQuery: string;
  languageFilter: string;
  sortOrder: string;
}

export function useTermsFiltering({
  terms,
  searchQuery,
  languageFilter,
  sortOrder,
}: UseTermsFilteringProps) {
  // Get unique languages from saved terms
  const availableLanguages = useMemo(() => {
    const languages = new Set(terms.map((term) => term.language));
    return Array.from(languages);
  }, [terms]);

  // Filter and sort terms based on search query, language, and sort order
  const filteredTerms = useMemo(() => {
    const filtered = terms.filter((term) => {
      const matchesSearch =
        term.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.translation?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLanguage =
        languageFilter === "all" || term.language === languageFilter;
      return matchesSearch && matchesLanguage;
    });

    // Sort the filtered terms
    return [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case "newest":
          return (b.createdAt || 0) - (a.createdAt || 0);
        case "oldest":
          return (a.createdAt || 0) - (b.createdAt || 0);
        case "az":
          return a.text.localeCompare(b.text);
        case "za":
          return b.text.localeCompare(a.text);
        default:
          return 0;
      }
    });
  }, [terms, searchQuery, languageFilter, sortOrder]);

  return {
    availableLanguages,
    filteredTerms,
  };
}
