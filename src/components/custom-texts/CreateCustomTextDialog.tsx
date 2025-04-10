"use client";

import { useState } from "react";
import { useCustomTexts } from "@/contexts/CustomTextsContext";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export function CreateCustomTextDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { addCustomText } = useCustomTexts();
  const { user } = useUser();

  const handleCreate = async () => {
    if (!title || !content || !user?.learningLanguage) return;

    await addCustomText({
      title,
      content,
      language: user.learningLanguage,
    });

    setTitle("");
    setContent("");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Custom Text</DialogTitle>
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
            <Button onClick={handleCreate} disabled={!title || !content}>
              Add Text
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
