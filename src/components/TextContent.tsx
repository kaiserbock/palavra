import { HighlightedContent } from "./HighlightedContent";

interface TextContentProps {
  content: string;
  language: string;
  isEnhancing?: boolean;
  enableHighlighting?: boolean;
}

export function TextContent({
  content,
  language,
  isEnhancing = false,
  enableHighlighting = false,
}: TextContentProps) {
  if (isEnhancing) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-4/5 mb-4"></div>
      </div>
    );
  }

  console.log("enableHighlighting", enableHighlighting, language);

  return (
    <div className="relative whitespace-pre-wrap">
      {enableHighlighting ? (
        <HighlightedContent content={content} language={language} />
      ) : (
        //
        <div className="select-text">{content}</div>
      )}
    </div>
  );
}
