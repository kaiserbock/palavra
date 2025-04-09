"use client";

import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import {
  SavedTermsProvider,
  useSavedTerms,
} from "@/contexts/SavedTermsContext";
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
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { LANGUAGE_NAMES } from "@/constants/languages";

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
  const { user, isLoading } = useUser();

  const {
    transcript,
    isLoading: transcriptLoading,
    isEnhancing,
    currentLanguage,
    isEnhanced,
    fetchTranscript,
    enhanceTranscript,
    resetTranscript,
    setTranscript,
  } = useTranscript();

  const { videoId, videoUrl, setVideo, resetVideo } = useVideo();
  const { savedTerms } = useSavedTerms();

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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-muted-foreground">
              Continue learning{" "}
              {isLoading
                ? "..."
                : user?.learningLanguage
                ? LANGUAGE_NAMES[user.learningLanguage]
                : "your target language"}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Saved Terms</h3>
                <BookMarked className="h-5 w-5 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-2">{savedTerms.length}</div>
              <p className="text-sm text-muted-foreground">Total saved terms</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Transcriptions</h3>
                <ScrollText className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold mb-2">
                <SavedTranscriptionsCount />
              </div>
              <p className="text-sm text-muted-foreground">Videos processed</p>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-4">
                <Button
                  onClick={() => setShowNewTranscriptionForm(true)}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Youtube className="h-4 w-4 mr-2 text-red-500" />
                  Process New Video
                </Button>
                <Button
                  onClick={() => setIsTermsDialogOpen(true)}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <BookMarked className="h-4 w-4 mr-2 text-primary" />
                  View Saved Terms
                </Button>
                <Link href="/flashcards" className="block">
                  <Button className="w-full justify-start" variant="outline">
                    <ScrollText className="h-4 w-4 mr-2 text-green-500" />
                    Practice Flashcards
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <RecentActivity />
              </div>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="space-y-6">
            {showNewTranscriptionForm && !transcript ? (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Process New Video
                </h3>
                <TranscriptForm
                  onSubmit={handleSubmit}
                  onCancel={() => setShowNewTranscriptionForm(false)}
                  isLoading={transcriptLoading}
                  hasTranscript={!!transcript}
                />
              </Card>
            ) : transcript ? (
              <Card className="overflow-hidden">
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
              </Card>
            ) : null}
          </div>
        </div>
      </main>
      <TermsDialog
        open={isTermsDialogOpen}
        onOpenChange={setIsTermsDialogOpen}
      />
      <Toaster />
    </div>
  );
}

// Helper component to show transcription count
function SavedTranscriptionsCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch("/api/transcriptions");
        if (response.ok) {
          const data = await response.json();
          setCount(Array.isArray(data) ? data.length : 0);
        }
      } catch (error) {
        console.error("Error fetching transcription count:", error);
      }
    };
    fetchCount();
  }, []);

  return count;
}

// Helper component to show recent activity
function RecentActivity() {
  const [activities, setActivities] = useState<
    Array<{ type: string; title: string; date: string }>
  >([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const [termsResponse, transcriptionsResponse] = await Promise.all([
          fetch("/api/terms"),
          fetch("/api/transcriptions"),
        ]);

        const terms = await termsResponse.json();
        const transcriptions = await transcriptionsResponse.json();

        // Combine and sort activities
        const allActivities = [
          ...terms.map((term: { text: string; createdAt: string }) => ({
            type: "term",
            title: term.text,
            date: new Date(term.createdAt),
          })),
          ...transcriptions.map(
            (trans: { name: string; createdAt: string }) => ({
              type: "transcription",
              title: trans.name,
              date: new Date(trans.createdAt),
            })
          ),
        ]
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 5)
          .map((activity) => ({
            ...activity,
            title:
              activity.title.length > 30
                ? activity.title.substring(0, 30) + "..."
                : activity.title,
            date: new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
            }).format(activity.date),
          }));

        setActivities(allActivities);
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };
    fetchActivities();
  }, []);

  if (activities.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        No recent activity
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {activity.type === "term" ? (
              <BookMarked className="h-4 w-4 text-primary flex-shrink-0" />
            ) : (
              <ScrollText className="h-4 w-4 text-green-500 flex-shrink-0" />
            )}
            <span className="text-sm truncate" title={activity.title}>
              {activity.title}
            </span>
          </div>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {activity.date}
          </span>
        </div>
      ))}
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
