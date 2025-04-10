import { toast } from "sonner";
import { ContentEditor } from "../common/ContentEditor";
import type { CustomText } from "@/types/custom-text";

interface CustomTextContentProps {
  text: CustomText;
  onClose: () => void;
  onTextChange: (text: CustomText) => void;
}

export function CustomTextContent({
  text,
  onClose,
  onTextChange,
}: CustomTextContentProps) {
  const handleSaveChanges = async (content: string) => {
    const response = await fetch(`/api/custom-texts/${text._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save changes");
    }

    const updatedText = await response.json();
    onTextChange(updatedText);
    toast.success("Changes saved successfully!");
  };

  return (
    <ContentEditor
      title={text.title}
      content={text.content}
      language={text.language}
      isLoaded={true}
      isEnhanced={true}
      onClose={onClose}
      onContentChange={(content) => {
        onTextChange({ ...text, content });
      }}
      onSaveChanges={handleSaveChanges}
    />
  );
}
