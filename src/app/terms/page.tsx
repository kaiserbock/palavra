"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SavedTermsProvider } from "@/contexts/SavedTermsContext";
import { Sidebar } from "@/components/TermsSidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { CreateTermDialog } from "@/components/terms/CreateTermDialog";

export default function TermsPage() {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <SavedTermsProvider>
      <div className="h-screen flex flex-col">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Saved Terms</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Sidebar />
        </div>

        <CreateTermDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      </div>
    </SavedTermsProvider>
  );
}
