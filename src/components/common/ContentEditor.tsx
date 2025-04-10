import { useState, useEffect } from "react";
import { TranscriptEditor } from "../transcript/TranscriptEditor";
import { ContentHeader } from "./ContentHeader";
import { ContentCard } from "./ContentCard";

interface ContentEditorProps {
  title: string;
  content: string;
  language: string;
  isLoaded: boolean;
  isEnhanced?: boolean;
  isEnhancing?: boolean;
  onEnhance?: () => void;
  onSave?: () => void;
  onClose: () => void;
  onContentChange: (content: string) => void;
  onSaveChanges: (content: string) => Promise<void>;
}

export function ContentEditor({
  title,
  content,
  language,
  isLoaded,
  isEnhanced = true,
  isEnhancing = false,
  onEnhance,
  onSave,
  onClose,
  onContentChange,
  onSaveChanges,
}: ContentEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  const handleEditSave = async () => {
    try {
      await onSaveChanges(editedContent);
      onContentChange(editedContent);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving changes:", error);
      return;
    }
  };

  const handleEditCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  return (
    <ContentCard
      header={
        <ContentHeader
          title={title}
          isEditing={isEditing}
          isEnhancing={isEnhancing}
          isEnhanced={isEnhanced}
          isLoaded={isLoaded}
          transcript={content}
          onEdit={() => setIsEditing(true)}
          onEnhance={onEnhance}
          onEditSave={handleEditSave}
          onEditCancel={handleEditCancel}
          onSave={onSave}
          onClose={onClose}
        />
      }
      content={
        <TranscriptEditor
          transcript={content}
          currentLanguage={language}
          isEnhancing={isEnhancing}
          isEditing={isEditing}
          isLoadedTranscription={isLoaded}
          editedTranscript={editedContent}
          onEditChange={setEditedContent}
        />
      }
    />
  );
}
