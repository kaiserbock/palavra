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

  const checkTranscriptionExists = async () => {
    if (!videoId) return false;
    try {
      const response = await fetch(`/api/transcriptions?videoId=${videoId}`);
      if (!response.ok) return false;
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error("Error checking transcription:", error);
      return false;
    }
  };

  const handleEnhance = async () => {
    const exists = await checkTranscriptionExists();
    if (exists) {
      toast.error("You have already saved this transcription");
      return;
    }
    onEnhance();
  };

  const handleSave = async () => {
    if (!videoId || !videoUrl || !transcriptionName.trim() || !isEnhanced) {
      return;
    }

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
        const errorData = await response.json();
        if (response.status === 409) {
          toast.error("You have already saved this transcription");
        } else {
          toast.error(errorData.error || "Failed to save transcription");
        }
        return;
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
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            videoId,
            enhancedTranscript: content,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          toast.error(errorData.error || "Failed to save changes");
          throw new Error(errorData.error || "Failed to save changes");
        }

        toast.success("Changes saved successfully!");
      } catch (error) {
        console.error("Error saving changes:", error);
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
        onEnhance={handleEnhance}
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
