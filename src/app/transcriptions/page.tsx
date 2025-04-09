"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SavedTranscriptions } from "@/components/transcript/TranscriptionList";
import { TranscriptContent } from "@/components/transcript/TranscriptContent";
import { TranscriptForm } from "@/components/transcript/TranscriptForm";
import { useTranscript } from "@/hooks/useTranscript";
import { useVideo } from "@/hooks/useVideo";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, Plus } from "lucide-react";
import { Toaster } from "sonner";
import { Input } from "@/components/ui/input";

interface Transcription {
  videoId: string;
  url: string;
  name: string;
  language: string;
  transcript: string;
  enhancedTranscript?: string;
}

export default function TranscriptionsPage() {
  const router = useRouter();
  const [showNewTranscriptionForm, setShowNewTranscriptionForm] =
    useState(false);
  const [transcriptionName, setTranscriptionName] = useState("");
  const [isLoadedTranscription, setIsLoadedTranscription] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    transcript,
    isLoading,
    isEnhancing,
    currentLanguage,
    isEnhanced,
    fetchTranscript,
    enhanceTranscript,
    resetTranscript,
    setTranscript,
    setCurrentLanguage,
    setIsEnhanced,
  } = useTranscript();

  const { videoId, videoUrl, setVideo, resetVideo } = useVideo();

  const handleSubmit = async (url: string, language: string) => {
    if (!setVideo(url)) return;
    setIsLoadedTranscription(false);
    const response = await fetchTranscript(url, language);
    if (response?.title) {
      setTranscriptionName(response.title);
    }
  };

  const handleSave = () => {
    setShowNewTranscriptionForm(false);
    resetTranscript();
    resetVideo();
    setIsLoadedTranscription(false);
    setTranscriptionName("");
    const event = new Event("transcriptionSaved");
    window.dispatchEvent(event);
  };

  const handleTranscriptionSelect = (transcription: Transcription) => {
    setVideo(transcription.url);
    setTranscript(transcription.enhancedTranscript || transcription.transcript);
    setCurrentLanguage(transcription.language);
    setIsEnhanced(!!transcription.enhancedTranscript);
    setIsLoadedTranscription(true);
    setTranscriptionName(transcription.name);
  };

  const handleNewTranscription = () => {
    setShowNewTranscriptionForm(true);
    resetTranscript();
    resetVideo();
    setIsLoadedTranscription(false);
  };

  const handleTranscriptionDelete = (deletedTranscription: Transcription) => {
    if (videoId === deletedTranscription.videoId) {
      resetTranscript();
      resetVideo();
      setIsLoadedTranscription(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {!transcript && (
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
            <h1 className="text-xl font-semibold">Transcriptions</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewTranscription}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          {/* Search Field */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transcriptions..."
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
        {showNewTranscriptionForm && !transcript ? (
          <div className="p-4">
            <TranscriptForm
              onSubmit={handleSubmit}
              onCancel={() => setShowNewTranscriptionForm(false)}
              isLoading={isLoading}
              hasTranscript={!!transcript}
            />
          </div>
        ) : transcript ? (
          <TranscriptContent
            transcript={transcript}
            videoId={videoId}
            videoUrl={videoUrl}
            currentLanguage={currentLanguage}
            isEnhanced={isEnhanced}
            isEnhancing={isEnhancing}
            isLoadedTranscription={isLoadedTranscription}
            transcriptionName={transcriptionName}
            onClose={() => {
              resetTranscript();
              resetVideo();
              setIsLoadedTranscription(false);
              setShowNewTranscriptionForm(false);
            }}
            onEnhance={enhanceTranscript}
            onSave={handleSave}
            onTranscriptionNameChange={setTranscriptionName}
            onTranscriptChange={setTranscript}
          />
        ) : (
          <div className="divide-y">
            <SavedTranscriptions
              onSelect={handleTranscriptionSelect}
              onNewTranscription={handleNewTranscription}
              onDelete={handleTranscriptionDelete}
              searchQuery={searchQuery}
            />
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
}
