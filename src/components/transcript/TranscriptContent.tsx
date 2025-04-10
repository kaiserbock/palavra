import { useState } from "react";
import { toast } from "sonner";
import { useSavedTerms } from "@/contexts/SavedTermsContext";
import { generateTermsList } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ContentEditor } from "../common/ContentEditor";

interface TranscriptContentProps {
  transcript: string;
  videoId: string | null;
  videoUrl: string;
  currentLanguage: string;
  isEnhanced: boolean;
  isEnhancing: boolean;
  isLoadedTranscription: boolean;
  transcriptionName: string;
  onClose: () => void;
  onEnhance: () => void;
  onSave: () => void;
  onTranscriptionNameChange: (name: string) => void;
  onTranscriptChange: (text: string) => void;
}

export function TranscriptContent({
  transcript,
  videoId,
  videoUrl,
  currentLanguage,
  isEnhanced,
  isEnhancing,
  isLoadedTranscription,
  transcriptionName,
  onClose,
  onEnhance,
  onSave,
  onTranscriptionNameChange,
  onTranscriptChange,
}: TranscriptContentProps) {
  const { savedTerms } = useSavedTerms();
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  const handleSave = async () => {
    if (!videoId || !videoUrl || !transcriptionName.trim() || !isEnhanced)
      return;

    try {
      const response = await fetch("/api/transcriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId,
          url: videoUrl,
          name: transcriptionName.trim(),
          language: currentLanguage,
          transcript: undefined,
          enhancedTranscript: transcript,
          terms: generateTermsList(transcript, savedTerms),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save transcription");
      }

      toast.success("Transcription saved successfully!");
      setIsSaveDialogOpen(false);
      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving transcription:", error);
      toast.error("Failed to save transcription");
    }
  };

  const handleSaveChanges = async (content: string) => {
    if (isLoadedTranscription) {
      try {
        const response = await fetch("/api/transcriptions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            videoId,
            url: videoUrl,
            name: transcriptionName.trim(),
            language: currentLanguage,
            enhancedTranscript: content,
            terms: generateTermsList(content, savedTerms),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save changes");
        }

        toast.success("Changes saved successfully!");
      } catch (error) {
        console.error("Error saving changes:", error);
        toast.error("Failed to save changes");
        throw error;
      }
    }
  };

  return (
    <>
      <ContentEditor
        title={transcriptionName}
        content={transcript}
        language={currentLanguage}
        isLoaded={isLoadedTranscription}
        isEnhanced={isEnhanced}
        isEnhancing={isEnhancing}
        onEnhance={onEnhance}
        onSave={() => setIsSaveDialogOpen(true)}
        onClose={onClose}
        onContentChange={onTranscriptChange}
        onSaveChanges={handleSaveChanges}
      />

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Transcription</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter a name for this transcription"
              value={transcriptionName}
              onChange={(e) => onTranscriptionNameChange(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSaveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!transcriptionName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
