import { LANGUAGE_NAMES } from "@/constants/languages";
import { BaseCard } from "../common/BaseCard";
import type { Transcription } from "@/types/transcription";

interface TranscriptionCardProps {
  transcription: Transcription;
  onTranscriptionClick: (transcription: Transcription) => void;
  onRemove?: (transcription: Transcription) => void;
  termsCount?: number;
}

export function TranscriptionCard({
  transcription,
  onTranscriptionClick,
  onRemove,
  termsCount,
}: TranscriptionCardProps) {
  return (
    <BaseCard
      title={transcription.name}
      language={LANGUAGE_NAMES[transcription.language]}
      onCardClick={() => onTranscriptionClick(transcription)}
      onRemove={onRemove ? () => onRemove(transcription) : undefined}
    >
      {termsCount !== undefined && (
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
          {termsCount} terms
        </span>
      )}
    </BaseCard>
  );
}
