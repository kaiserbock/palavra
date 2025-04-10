"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CustomTextList } from "@/components/custom-texts/CustomTextList";
import { CustomTextContent } from "@/components/custom-texts/CustomTextContent";
import { CustomTextForm } from "@/components/custom-texts/CustomTextForm";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, Plus } from "lucide-react";
import { Toaster } from "sonner";
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/useUser";
import { useCustomTexts } from "@/contexts/CustomTextsContext";
import type { CustomText } from "@/types/custom-text";

export default function TextsPage() {
  const router = useRouter();
  const [showNewTextForm, setShowNewTextForm] = useState(false);
  const [textTitle, setTextTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedText, setSelectedText] = useState<CustomText | null>(null);
  const { user } = useUser();
  const { addCustomText } = useCustomTexts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textTitle || !textContent || !user?.learningLanguage) return;

    try {
      await addCustomText({
        title: textTitle,
        content: textContent,
        language: user.learningLanguage,
      });
      setShowNewTextForm(false);
      setTextTitle("");
      setTextContent("");
    } catch (error) {
      console.error("Error adding custom text:", error);
    }
  };

  const handleTextSelect = (text: CustomText) => {
    setSelectedText(text);
  };

  const handleNewText = () => {
    setShowNewTextForm(true);
    setSelectedText(null);
  };

  const handleTextDelete = (deletedText: CustomText) => {
    if (selectedText?._id === deletedText._id) {
      setSelectedText(null);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {!selectedText && !showNewTextForm && (
        <>
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Custom Texts</h1>
            <Button variant="ghost" size="icon" onClick={handleNewText}>
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          {/* Search Field */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search texts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {showNewTextForm && !selectedText ? (
          <div className="p-4">
            <CustomTextForm
              onSubmit={handleSubmit}
              onCancel={() => setShowNewTextForm(false)}
              title={textTitle}
              content={textContent}
              onTitleChange={setTextTitle}
              onContentChange={setTextContent}
            />
          </div>
        ) : selectedText ? (
          <CustomTextContent
            text={selectedText}
            onClose={() => {
              setSelectedText(null);
              setShowNewTextForm(false);
            }}
            onTextChange={(updatedText) => setSelectedText(updatedText)}
          />
        ) : (
          <div className="divide-y">
            <CustomTextList
              onSelect={handleTextSelect}
              onNewText={handleNewText}
              onDelete={handleTextDelete}
              searchQuery={searchQuery}
            />
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
}
