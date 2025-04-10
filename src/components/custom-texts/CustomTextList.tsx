"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { DeleteCustomTextDialog } from "./DeleteCustomTextDialog";
import { CustomTextCard } from "./CustomTextCard";
import type { CustomText } from "@/types/custom-text";
import { generateTermsList } from "@/lib/utils";
import { useSavedTerms } from "@/contexts/SavedTermsContext";
import { useCustomTexts } from "@/contexts/CustomTextsContext";

interface CustomTextListProps {
  onSelect: (text: CustomText) => void;
  onNewText: () => void;
  onDelete: (text: CustomText) => void;
  searchQuery?: string;
}

export function CustomTextList({
  onSelect,
  onNewText,
  onDelete,
  searchQuery = "",
}: CustomTextListProps) {
  const { customTexts, isLoading } = useCustomTexts();
  const { savedTerms } = useSavedTerms();
  const [textToDelete, setTextToDelete] = useState<CustomText | null>(null);

  const handleDelete = async (text: CustomText) => {
    try {
      const response = await fetch(`/api/custom-texts/${text._id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete text");

      toast.success("Text deleted successfully");
      onDelete(text);
    } catch (error) {
      console.error("Error deleting text:", error);
      toast.error("Failed to delete text");
    } finally {
      setTextToDelete(null);
    }
  };

  const filteredTexts = useMemo(() => {
    if (!searchQuery) return customTexts;
    const query = searchQuery.toLowerCase();
    return customTexts.filter((t) => t.title.toLowerCase().includes(query));
  }, [customTexts, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (filteredTexts.length === 0) {
    if (searchQuery) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No texts found matching &ldquo;{searchQuery}&rdquo;
        </div>
      );
    }
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No custom texts saved yet</p>
        <Button onClick={onNewText} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add New Text
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y">
        {filteredTexts.map((text) => {
          const result = generateTermsList(text.content, savedTerms, true);
          const uniqueCount = "uniqueCount" in result ? result.uniqueCount : 0;

          return (
            <CustomTextCard
              key={text._id}
              text={text}
              onTextClick={onSelect}
              onRemove={(text) => setTextToDelete(text)}
              termsCount={uniqueCount}
            />
          );
        })}
      </div>

      <DeleteCustomTextDialog
        text={textToDelete}
        onOpenChange={(open) => !open && setTextToDelete(null)}
        onDelete={handleDelete}
      />
    </>
  );
}
