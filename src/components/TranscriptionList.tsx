import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { generateTermsList } from "@/lib/utils";
import { useSavedTerms } from "@/contexts/SavedTermsContext";
import { LANGUAGE_NAMES } from "@/constants/languages";
import { DeleteTranscriptionDialog } from "./DeleteTranscriptionDialog";

interface Transcription {
  _id: string;
  videoId: string;
  url: string;
  name: string;
  language: string;
  transcript: string;
  enhancedTranscript?: string;
  createdAt: string;
  terms: {
    text: string;
    translation?: string;
    position?: {
      start: number;
      end: number;
    };
  }[];
}

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
      <div className="space-y-2">
        {filteredTranscriptions.map((transcription) => {
          const transcript =
            transcription.enhancedTranscript || transcription.transcript;
          const result = generateTermsList(transcript, savedTerms, true);
          const uniqueCount = "uniqueCount" in result ? result.uniqueCount : 0;

          return (
            <div
              key={transcription._id}
              className="group relative p-3 rounded-lg border hover:bg-accent transition-colors w-full"
            >
              <div
                className="flex items-start gap-3 cursor-pointer touch-manipulation"
                onClick={() => onSelect(transcription)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-sm truncate pr-2">
                      {transcription.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTranscriptionToDelete(transcription);
                        }}
                        className="h-6 w-6 shrink-0 bg-transparent hover:bg-transparent text-muted-foreground hover:text-destructive focus:text-destructive sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100 transition-colors duration-200 cursor-pointer touch-manipulation"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
                    <span className="inline-flex items-center text-[10px] leading-none px-1.5 py-0.5 rounded bg-secondary/50 text-secondary-foreground shrink-0">
                      {LANGUAGE_NAMES[transcription.language]}
                    </span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {new Date(transcription.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {uniqueCount} terms
                    </span>
                  </div>
                </div>
              </div>
            </div>
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
