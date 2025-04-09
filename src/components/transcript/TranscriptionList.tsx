import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { DeleteTranscriptionDialog } from "../DeleteTranscriptionDialog";
import { TranscriptionCard } from "./TranscriptionCard";
import type { Transcription } from "@/types/transcription";
import { generateTermsList } from "@/lib/utils";
import { useSavedTerms } from "@/contexts/SavedTermsContext";

interface SavedTranscriptionsProps {
  onSelect: (transcription: Transcription) => void;
  onNewTranscription: () => void;
  onDelete: (transcription: Transcription) => void;
  searchQuery?: string;
}

export function SavedTranscriptions({
  onSelect,
  onNewTranscription,
  onDelete,
  searchQuery = "",
}: SavedTranscriptionsProps) {
  const { savedTerms } = useSavedTerms();
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transcriptionToDelete, setTranscriptionToDelete] =
    useState<Transcription | null>(null);

  const loadTranscriptions = async () => {
    try {
      console.log("Fetching transcriptions...");
      const response = await fetch("/api/transcriptions");
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.error || "Failed to load transcriptions");
      }
      const data = await response.json();
      console.log("Successfully loaded transcriptions:", data);
      setTranscriptions(data);
    } catch (error) {
      console.error("Error loading transcriptions:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load transcriptions"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTranscriptions();

    // Listen for transcription saved events
    const handleTranscriptionSaved = () => {
      loadTranscriptions();
    };

    window.addEventListener("transcriptionSaved", handleTranscriptionSaved);

    return () => {
      window.removeEventListener(
        "transcriptionSaved",
        handleTranscriptionSaved
      );
    };
  }, []);

  const handleDelete = async (transcription: Transcription) => {
    try {
      const response = await fetch(
        `/api/transcriptions?videoId=${transcription.videoId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete transcription");

      toast.success("Transcription deleted successfully");
      loadTranscriptions(); // Reload the list
      onDelete(transcription); // Call onDelete
    } catch (error) {
      console.error("Error deleting transcription:", error);
      toast.error("Failed to delete transcription");
    } finally {
      setTranscriptionToDelete(null);
    }
  };

  const filteredTranscriptions = useMemo(() => {
    if (!searchQuery) return transcriptions;
    const query = searchQuery.toLowerCase();
    return transcriptions.filter((t) => t.name.toLowerCase().includes(query));
  }, [transcriptions, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (filteredTranscriptions.length === 0) {
    if (searchQuery) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No transcriptions found matching &ldquo;{searchQuery}&rdquo;
        </div>
      );
    }
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          No transcriptions saved yet
        </p>
        <Button onClick={onNewTranscription} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Process New Video
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y">
        {filteredTranscriptions.map((transcription) => {
          const transcript =
            transcription.enhancedTranscript || transcription.transcript;
          const result = generateTermsList(transcript, savedTerms, true);
          const uniqueCount = "uniqueCount" in result ? result.uniqueCount : 0;

          return (
            <TranscriptionCard
              key={transcription._id}
              transcription={transcription}
              onTranscriptionClick={onSelect}
              onRemove={(transcription) =>
                setTranscriptionToDelete(transcription)
              }
              termsCount={uniqueCount}
            />
          );
        })}
      </div>

      <DeleteTranscriptionDialog
        transcription={transcriptionToDelete}
        onOpenChange={(open) => !open && setTranscriptionToDelete(null)}
        onDelete={handleDelete}
      />
    </>
  );
}
