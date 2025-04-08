import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2, Save, X, Edit, Check } from "lucide-react";

interface TranscriptHeaderProps {
  transcriptionName: string;
  isLoadedTranscription: boolean;
  isEnhanced: boolean;
  isEnhancing: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onEnhance: () => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onSave: () => void;
  onClose: () => void;
}

export function TranscriptHeader({
  transcriptionName,
  isLoadedTranscription,
  isEnhanced,
  isEnhancing,
  isEditing,
  onEdit,
  onEnhance,
  onEditSave,
  onEditCancel,
  onSave,
  onClose,
}: TranscriptHeaderProps) {
  return (
    <CardHeader className="md:pb-4 px-6">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg">
          {transcriptionName || "Untitled Transcript"}
        </CardTitle>
        <div className="flex items-center gap-2">
          {!isLoadedTranscription && !isEnhanced && !isEditing && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                disabled={isEnhancing}
                className="h-8"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onEnhance}
                disabled={isEnhancing}
                className="h-8"
              >
                {isEnhancing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Enhance
                  </>
                )}
              </Button>
            </>
          )}
          {isEditing && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onEditCancel}
                className="h-8"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onEditSave}
                className="h-8"
              >
                <Check className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          )}
          {!isLoadedTranscription && isEnhanced && !isEditing && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                disabled={isEnhancing}
                className="h-8"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onSave}
                className="h-8"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </>
          )}
          {isLoadedTranscription && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              disabled={isEnhancing}
              className="h-8"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardHeader>
  );
}
