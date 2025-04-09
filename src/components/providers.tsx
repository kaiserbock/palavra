"use client";

import { SessionProvider } from "next-auth/react";
import { FlashcardListsProvider } from "@/contexts/FlashcardListsContext";
import { SavedTermsProvider } from "@/contexts/SavedTermsContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SavedTermsProvider>
        <FlashcardListsProvider>{children}</FlashcardListsProvider>
      </SavedTermsProvider>
    </SessionProvider>
  );
}
