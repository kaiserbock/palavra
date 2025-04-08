import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSavedTerms } from "@/contexts/SavedTermsContext";
import { LANGUAGE_NAMES } from "@/constants/languages";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CreateTermDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTermDialog({
  open,
  onOpenChange,
}: CreateTermDialogProps) {
  const { addTerm, hasTerm } = useSavedTerms();
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("en");
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async () => {
    if (!text.trim()) return;

    // Check if term already exists
    if (hasTerm(text, language)) {
      toast.error("Term already exists");
      return;
    }

    setIsSaving(true);

    try {
      // If the term is not in English, get its translation first
      let translation: string | undefined;
      if (language !== "en") {
        try {
          const response = await fetch("/api/translate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text,
              fromLanguage: language,
            }),
          });

          if (!response.ok) {
            console.error("Translation failed:", await response.text());
            // Continue without translation instead of throwing error
            toast.warning("Could not get translation, saving term without it");
          } else {
            const data = await response.json();
            translation = data.translation;
          }
        } catch (error) {
          console.error("Translation error:", error);
          // Continue without translation instead of throwing error
          toast.warning("Could not get translation, saving term without it");
        }
      }

      // Save the term with its translation
      await addTerm(text, language, translation);

      toast.success("Term saved successfully");
      setText("");
      setLanguage("en");
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving term:", error);
      toast.error("Failed to save term");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Term</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            placeholder="Enter term"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                <SelectItem key={code} value={code}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!text.trim() || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
