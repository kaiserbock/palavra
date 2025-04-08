import { ScrollArea } from "@/components/ui/scroll-area";
import { TextContent } from "@/components/TextContent";
import { Textarea } from "@/components/ui/textarea";

interface TranscriptEditorProps {
  transcript: string;
  currentLanguage: string;
  isEnhancing: boolean;
  isEditing: boolean;
  isLoadedTranscription: boolean;
  editedTranscript: string;
  onEditChange: (value: string) => void;
}

export function TranscriptEditor({
  transcript,
  currentLanguage,
  isEnhancing,
  isEditing,
  isLoadedTranscription,
  editedTranscript,
  onEditChange,
}: TranscriptEditorProps) {
  return (
    <ScrollArea className="h-full bg-gray-50">
      <div className="p-6">
        {isEditing ? (
          <Textarea
            value={editedTranscript}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              onEditChange(e.target.value)
            }
            className="min-h-[500px] font-mono text-sm resize-none"
          />
        ) : (
          <TextContent
            content={transcript}
            language={currentLanguage}
            isEnhancing={isEnhancing}
            enableHighlighting={isLoadedTranscription}
          />
        )}
      </div>
    </ScrollArea>
  );
}
