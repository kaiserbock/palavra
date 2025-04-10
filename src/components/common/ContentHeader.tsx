import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Check, X, Wand2, Loader2, Save } from "lucide-react";
import { TermsDrawer } from "../TermsDrawer";

interface ContentHeaderProps {
  title: string;
  isEditing: boolean;
  isEnhancing: boolean;
  isEnhanced: boolean;
  isLoaded: boolean;
  transcript: string;
  onEdit: () => void;
  onEnhance?: () => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onSave?: () => void;
  onClose: () => void;
}

export function ContentHeader({
  title,
  isEditing,
  isEnhancing,
  isEnhanced,
  isLoaded,
  transcript,
  onEdit,
  onEnhance,
  onEditSave,
  onEditCancel,
  onSave,
  onClose,
}: ContentHeaderProps) {
  return (
    <CardHeader className="md:pb-4 px-6 pt-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-end gap-2">
          {!isLoaded && !isEnhanced && !isEditing && onEnhance && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                disabled={isEnhancing}
                className="h-8 w-8"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onEnhance}
                disabled={isEnhancing}
                className="h-8 w-8"
              >
                {isEnhancing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
              </Button>
            </>
          )}
          {isEditing && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={onEditCancel}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onEditSave}
                className="h-8 w-8"
              >
                <Check className="h-4 w-4" />
              </Button>
            </>
          )}
          {!isLoaded && isEnhanced && !isEditing && onSave && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                disabled={isEnhancing}
                className="h-8 w-8"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSave}
                className="h-8 w-8"
              >
                <Save className="h-4 w-4" />
              </Button>
            </>
          )}
          {isLoaded && !isEditing && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              disabled={isEnhancing}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          <TermsDrawer transcript={transcript} />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardTitle className="text-lg">{title || "Untitled Content"}</CardTitle>
      </div>
    </CardHeader>
  );
}
