import { WordCategory } from "@/contexts/SavedTermsContext";

interface TermTooltipProps {
  text: string;
  translation?: string;
  category?: WordCategory;
  position: { x: number; y: number };
  placement: "top" | "bottom";
  tooltipRef: React.Ref<HTMLDivElement>;
}

export function TermTooltip({
  text,
  translation,
  category,
  position,
  placement,
  tooltipRef,
}: TermTooltipProps) {
  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-4 text-sm border border-gray-100 dark:border-gray-700"
      style={{
        left: position.x,
        top: position.y,
        transform: `translate(-50%, ${placement === "top" ? "-100%" : "0"})`,
        maxWidth: "min(320px, calc(100vw - 32px))",
      }}
    >
      <div className="flex flex-col gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-base text-gray-900 dark:text-gray-50">
              {text}
            </p>
            {category && (
              <span className="text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {category}
              </span>
            )}
          </div>
        </div>
        {translation ? (
          <>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              {translation.split("•").map((trans, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span>{trans.trim()}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm italic text-gray-500 dark:text-gray-400">
            No translation available
          </p>
        )}
      </div>
    </div>
  );
}
