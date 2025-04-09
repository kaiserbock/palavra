import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { TranscriptHeader } from "./TranscriptHeader";
import { TranscriptEditor } from "./TranscriptEditor";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState(transcript);

  useEffect(() => {
    setEditedTranscript(transcript);
  }, [transcript]);

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

  const handleEditSave = async () => {
    if (isLoadedTranscription) {
      // Save changes to database for saved transcriptions
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
            enhancedTranscript: editedTranscript,
            terms: generateTermsList(editedTranscript, savedTerms),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save changes");
        }

        toast.success("Changes saved successfully!");
      } catch (error) {
        console.error("Error saving changes:", error);
        toast.error("Failed to save changes");
        return;
      }
    }

    onTranscriptChange(editedTranscript);
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditedTranscript(transcript);
    setIsEditing(false);
  };

  return (
    <>
      <Card className="h-full flex flex-col border-0 sm:border gap-2 py-0 md:py-4 overflow-hidden">
        <TranscriptHeader
          transcriptionName={transcriptionName}
          isLoadedTranscription={isLoadedTranscription}
          isEnhanced={isEnhanced}
          isEnhancing={isEnhancing}
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onEnhance={onEnhance}
          onEditSave={handleEditSave}
          onEditCancel={handleEditCancel}
          onSave={() => setIsSaveDialogOpen(true)}
          onClose={onClose}
        />
        <CardContent className="p-0 flex-1 min-h-0">
          <TranscriptEditor
            transcript={transcript}
            currentLanguage={currentLanguage}
            isEnhancing={isEnhancing}
            isEditing={isEditing}
            isLoadedTranscription={isLoadedTranscription}
            editedTranscript={editedTranscript}
            onEditChange={setEditedTranscript}
          />
        </CardContent>
      </Card>

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
