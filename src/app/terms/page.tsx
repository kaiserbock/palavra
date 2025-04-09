"use client";

import { Header } from "@/components/Header";
import { SavedTermsProvider } from "@/contexts/SavedTermsContext";
import { Sidebar } from "@/components/TermsSidebar";

export default function TermsPage() {
  return (
    <SavedTermsProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Saved Terms</h1>
              <p className="text-muted-foreground">
                Review and manage your saved terms and translations
              </p>
            </div>

            <Sidebar />
          </div>
        </div>
      </div>
    </SavedTermsProvider>
  );
}
