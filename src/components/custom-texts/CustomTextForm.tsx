import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface CustomTextFormProps {
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  title: string;
  content: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
}

export function CustomTextForm({
  onSubmit,
  onCancel,
  title,
  content,
  onTitleChange,
  onContentChange,
}: CustomTextFormProps) {
  return (
    <Card className="p-6">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <Input
            id="name"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter a name for your text"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium">
            Content
          </label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Enter your text here"
            className="min-h-[200px]"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!title || !content}>
            Add Text
          </Button>
        </div>
      </form>
    </Card>
  );
}
