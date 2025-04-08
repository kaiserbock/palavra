"use client";

import { useState } from "react";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/TermsSidebar";
import { SavedTermsProvider } from "@/contexts/SavedTermsContext";
import { SavedTranscriptions } from "@/components/TranscriptionList";
import { TranscriptContent } from "@/components/transcript/TranscriptContent";
import { TranscriptForm } from "@/components/transcript/TranscriptForm";
import { useTranscript } from "@/hooks/useTranscript";
import { useVideo } from "@/hooks/useVideo";
import { Header } from "@/components/Header";
import { TermsDialog } from "@/components/TermsDialog";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Youtube,
  Languages,
  BookMarked,
  ScrollText,
  ChevronRight,
} from "lucide-react";
import { signIn } from "next-auth/react";

interface Transcription {
  videoId: string;
  url: string;
  name: string;
  language: string;
  transcript: string;
  enhancedTranscript?: string;
}

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl">
                YouTube Transcript
                <span className="block text-muted-foreground">
                  Enhance & Learn
                </span>
              </h1>
              <p className="mt-3 text-base text-muted-foreground sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Transform your YouTube learning experience with our powerful
                transcript tool. Get instant access to video transcripts,
                enhance them with AI, and create personalized flashcards for
                better learning.
              </p>
              <div className="mt-8 space-y-8">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <Youtube className="h-8 w-8 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Video Transcripts</h2>
                    <p className="mt-1 text-muted-foreground">
                      Access transcripts from any YouTube video in seconds
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <Languages className="h-8 w-8 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">
                      Multi-language Support
                    </h2>
                    <p className="mt-1 text-muted-foreground">
                      Work with transcripts in multiple languages
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <BookMarked className="h-8 w-8 text-green-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">
                      Save Important Terms
                    </h2>
                    <p className="mt-1 text-muted-foreground">
                      Bookmark and translate key terms and phrases
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <ScrollText className="h-8 w-8 text-purple-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Flashcards</h2>
                    <p className="mt-1 text-muted-foreground">
                      Create and study flashcards from saved terms
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                <div className="relative block w-full bg-background rounded-lg p-8 border-2">
                  <div className="text-center">
                    <h3 className="text-2xl font-semibold mb-4">
                      Get Started Today
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Sign in to access all features and start enhancing your
                      learning experience.
                    </p>
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={() => signIn()}
                    >
                      Sign in to Continue
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function HomeContent() {
  const [showNewTranscriptionForm, setShowNewTranscriptionForm] =
    useState(false);
  const [transcriptionName, setTranscriptionName] = useState("");
  const [isLoadedTranscription, setIsLoadedTranscription] = useState(false);
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);

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
    // Reset all transcript-related state
    resetTranscript();
    resetVideo();
    setIsLoadedTranscription(false);
    setTranscriptionName("");
    // Force a refresh of the transcriptions list
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
    // If the deleted transcription is currently open, close it
    if (videoId === deletedTranscription.videoId) {
      resetTranscript();
      resetVideo();
      setIsLoadedTranscription(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header onOpenTerms={() => setIsTermsDialogOpen(true)} />
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="h-full flex flex-col lg:flex-row lg:gap-8">
            <main className="flex-1 min-w-0 order-2 lg:order-1 overflow-hidden flex flex-col">
              {showNewTranscriptionForm && !transcript ? (
                <TranscriptForm
                  onSubmit={handleSubmit}
                  onCancel={() => setShowNewTranscriptionForm(false)}
                  isLoading={isLoading}
                  hasTranscript={!!transcript}
                />
              ) : transcript ? (
                <div className="flex-1 min-h-0">
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
                </div>
              ) : (
                <div className="mb-6 sm:mb-8 flex-shrink-0">
                  <SavedTranscriptions
                    onSelect={handleTranscriptionSelect}
                    onNewTranscription={handleNewTranscription}
                    onDelete={handleTranscriptionDelete}
                  />
                </div>
              )}
            </main>

            <aside className="hidden lg:block w-[320px] order-2 overflow-hidden flex-shrink-0">
              <Sidebar />
            </aside>
          </div>
        </div>
      </div>
      <TermsDialog
        open={isTermsDialogOpen}
        onOpenChange={setIsTermsDialogOpen}
      />
      <Toaster />
    </div>
  );
}

export default function Home() {
  const { data: session } = useSession();

  return (
    <SavedTermsProvider>
      {session ? <HomeContent /> : <LandingPage />}
    </SavedTermsProvider>
  );
}
