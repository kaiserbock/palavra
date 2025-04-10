import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

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

interface DeleteTranscriptionDialogProps {
  transcription: Transcription | null;
  onOpenChange: (open: boolean) => void;
  onDelete: (transcription: Transcription) => Promise<void>;
}

export function DeleteTranscriptionDialog({
  transcription,
  onOpenChange,
  onDelete,
}: DeleteTranscriptionDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!transcription) return;
    setIsDeleting(true);
    await onDelete(transcription);
    setIsDeleting(false);
  };

  return (
    <AlertDialog open={!!transcription} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-98 data-[state=open]:zoom-in-98 duration-100">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">
            Delete Transcription
          </AlertDialogTitle>
          <AlertDialogDescription className="pt-2">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">
              {transcription?.name}
            </span>
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:space-x-2">
          <AlertDialogCancel className="sm:w-24 cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="sm:w-24 cursor-pointer bg-white hover:bg-white/90 text-destructive hover:text-destructive/90 border border-destructive hover:border-destructive/90 transition-colors"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Deleting</span>
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
