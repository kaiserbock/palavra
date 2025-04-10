import { LANGUAGE_NAMES } from "@/constants/languages";
import { BaseCard } from "../common/BaseCard";
import type { CustomText } from "@/types/custom-text";

interface CustomTextCardProps {
  text: CustomText;
  onTextClick: (text: CustomText) => void;
  onRemove?: (text: CustomText) => void;
  termsCount?: number;
}

export function CustomTextCard({
  text,
  onTextClick,
  onRemove,
  termsCount,
}: CustomTextCardProps) {
  return (
    <BaseCard
      title={text.title}
      language={LANGUAGE_NAMES[text.language]}
      onCardClick={() => onTextClick(text)}
      onRemove={onRemove ? () => onRemove(text) : undefined}
    >
      {termsCount !== undefined && (
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
          {termsCount} terms
        </span>
      )}
    </BaseCard>
  );
}
