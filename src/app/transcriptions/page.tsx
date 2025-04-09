"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { SavedTranscriptions } from "@/components/TranscriptionList";
import { TranscriptContent } from "@/components/transcript/TranscriptContent";
import { TranscriptForm } from "@/components/transcript/TranscriptForm";
import { useTranscript } from "@/hooks/useTranscript";
import { useVideo } from "@/hooks/useVideo";
import { Button } from "@/components/ui/button";
import { Youtube, Search } from "lucide-react";
import { Toaster } from "sonner";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Transcription {
  videoId: string;
  url: string;
  name: string;
  language: string;
  transcript: string;
  enhancedTranscript?: string;
}

export default function TranscriptionsPage() {
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
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col gap-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">Transcriptions</h1>
                <p className="text-muted-foreground mt-1">
                  Process and manage your video transcriptions
                </p>
              </div>
              {!(showNewTranscriptionForm || transcript) && (
                <Button
                  onClick={handleNewTranscription}
                  size="default"
                  className="shrink-0"
                >
                  <Youtube className="h-4 w-4 mr-2" />
                  New Transcription
                </Button>
              )}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              {/* Transcriptions List */}
              <div
                className={cn(
                  "xl:col-span-4",
                  (showNewTranscriptionForm || transcript) && "hidden xl:block"
                )}
              >
                <Card className="h-full">
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
                  <ScrollArea className="h-[calc(100dvh-20rem)] overflow-y-auto">
                    <div className="p-4">
                      <SavedTranscriptions
                        onSelect={handleTranscriptionSelect}
                        onNewTranscription={handleNewTranscription}
                        onDelete={handleTranscriptionDelete}
                        searchQuery={searchQuery}
                      />
                    </div>
                  </ScrollArea>
                </Card>
              </div>

              {/* Transcription Content */}
              <div
                className={cn(
                  "xl:col-span-8",
                  !(showNewTranscriptionForm || transcript) && "hidden xl:block"
                )}
              >
                {showNewTranscriptionForm && !transcript ? (
                  <Card>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">
                          Process New Video
                        </h2>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowNewTranscriptionForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                      <TranscriptForm
                        onSubmit={handleSubmit}
                        onCancel={() => setShowNewTranscriptionForm(false)}
                        isLoading={isLoading}
                        hasTranscript={!!transcript}
                      />
                    </div>
                  </Card>
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
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Youtube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        Select a Transcription
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Choose a transcription from the list or create a new one
                      </p>
                      <Button onClick={handleNewTranscription}>
                        <Youtube className="h-4 w-4 mr-2" />
                        New Transcription
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
