"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/contexts/UserContext";
import { SavedTermsProvider } from "@/contexts/SavedTermsContext";
import { FlashcardListsProvider } from "@/contexts/FlashcardListsContext";
import { CustomTextsProvider } from "@/contexts/CustomTextsContext";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <UserProvider>
          <SavedTermsProvider>
            <FlashcardListsProvider>
              <CustomTextsProvider>
                {children}
                <Toaster />
              </CustomTextsProvider>
            </FlashcardListsProvider>
          </SavedTermsProvider>
        </UserProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
