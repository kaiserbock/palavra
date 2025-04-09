import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface BaseCardProps {
  title: string;
  language?: string;
  category?: string;
  onCardClick: () => void;
  onRemove?: () => void;
  children?: React.ReactNode;
}

export function BaseCard({
  title,
  language,
  category,
  onCardClick,
  onRemove,
  children,
}: BaseCardProps) {
  return (
    <div
      onClick={onCardClick}
      className="group relative p-3 hover:bg-accent transition-colors cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-sm wrap-break-word pr-2">
              {title}
            </h3>
            {onRemove && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="h-6 w-6 shrink-0 bg-transparent hover:bg-transparent text-muted-foreground hover:text-destructive focus:text-destructive sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100 transition-colors duration-200 cursor-pointer touch-manipulation"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
            {language && (
              <span className="inline-flex items-center text-[10px] leading-none px-1.5 py-0.5 rounded bg-secondary/50 text-secondary-foreground shrink-0">
                {language}
              </span>
            )}
            {category && (
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {category}
              </span>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
