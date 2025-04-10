"use client";

import * as React from "react";
import { useCustomTexts } from "@/contexts/CustomTextsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ICustomText } from "@/models/CustomText";

interface EditCustomTextDialogProps {
  text: ICustomText;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCustomTextDialog({
  text,
  isOpen,
  onOpenChange,
}: EditCustomTextDialogProps) {
  const [title, setTitle] = React.useState(text.title);
  const [content, setContent] = React.useState(text.content);
  const { updateCustomText } = useCustomTexts();

  React.useEffect(() => {
    setTitle(text.title);
    setContent(text.content);
  }, [text]);

  const handleUpdate = async () => {
    if (!title || !content) return;

    await updateCustomText(text._id, {
      title,
      content,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Text</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your text"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Content
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your text here"
              className="min-h-[200px]"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleUpdate} disabled={!title || !content}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
