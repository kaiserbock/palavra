import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Pencil } from "lucide-react";
import { LANGUAGE_NAMES } from "@/constants/languages";
import type { SelectedTerm } from "@/hooks/useTermTranslation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSavedTerms } from "@/contexts/SavedTermsContext";

interface TermDialogProps {
  selectedTerm: SelectedTerm | null;
  isTranslating: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermDialog({
  selectedTerm,
  isTranslating,
  onOpenChange,
}: TermDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTranslation, setEditedTranslation] = useState("");
  const { updateTermTranslation } = useSavedTerms();

  if (!selectedTerm) return null;

  const translations = selectedTerm.translation?.split("•");

  const handleEditClick = () => {
    setEditedTranslation(selectedTerm.translation || "");
    setIsEditing(true);
  };

  const handleSave = () => {
    if (selectedTerm && editedTranslation.trim()) {
      updateTermTranslation(
        selectedTerm.text,
        selectedTerm.language,
        editedTranslation.trim()
      );
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTranslation("");
  };

  return (
    <Dialog open={!!selectedTerm} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <DialogTitle className="text-xl">
              {LANGUAGE_NAMES[selectedTerm.language]}
            </DialogTitle>
            {selectedTerm.category && (
              <span className="text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {selectedTerm.category}
              </span>
            )}
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              {selectedTerm.text}
            </p>
          </div>
          {selectedTerm.language !== "en" && (
            <div className="space-y-3">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
              {isTranslating ? (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Translating...
                  </span>
                </div>
              ) : isEditing ? (
                <div className="space-y-4">
                  <Textarea
                    value={editedTranslation}
                    onChange={(e) => setEditedTranslation(e.target.value)}
                    placeholder="Enter translation"
                    className="min-h-[100px]"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={!editedTranslation.trim()}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  {translations?.map((trans: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 items-center group cursor-pointer hover:bg-accent/50 rounded-md p-2 -mx-2 transition-colors"
                      onClick={handleEditClick}
                      role="button"
                      tabIndex={0}
                    >
                      {translations.length > 1 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 shrink-0 mt-2" />
                      )}
                      <span className="leading-relaxed flex-1">
                        {trans.trim()}
                      </span>
                      <Pencil className="h-4 w-4 opacity-0 group-hover:opacity-70 transition-opacity" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
