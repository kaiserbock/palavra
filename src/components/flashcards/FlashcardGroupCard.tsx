import { BaseCard } from "../common/BaseCard";
import { useFlashcardLists } from "@/contexts/FlashcardListsContext";

interface FlashcardGroupCardProps {
  listId: string;
  onGroupClick: (listId: string) => void;
  onRemove?: (listId: string) => void;
}

export function FlashcardGroupCard({
  listId,
  onGroupClick,
  onRemove,
}: FlashcardGroupCardProps) {
  const { lists } = useFlashcardLists();
  const list = lists.find((l) => l.id === listId);

  if (!list) return null;

  return (
    <BaseCard
      title={list.name}
      onCardClick={() => onGroupClick(listId)}
      onRemove={onRemove ? () => onRemove(listId) : undefined}
    >
      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
        {list.termIds.length} terms
      </span>
    </BaseCard>
  );
}
