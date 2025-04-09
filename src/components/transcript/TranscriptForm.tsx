import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ChevronDown, ChevronUp, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LANGUAGE_NAMES } from "@/constants/languages";

interface TranscriptFormProps {
  onSubmit: (url: string, language: string) => void;
  onCancel: () => void;
  isLoading: boolean;
  hasTranscript: boolean;
}

export function TranscriptForm({
  onSubmit,
  onCancel,
  isLoading,
  hasTranscript,
}: TranscriptFormProps) {
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState<string | null>(null);
  const [isCheckingLanguages, setIsCheckingLanguages] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAvailableLanguages = async () => {
      if (!url) {
        setLanguage(null);
        setError(null);
        return;
      }

      // More flexible YouTube URL validation
      const youtubeRegex =
        /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/v\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})(?:[?&].*)?$/;
      const cleanUrl = url.trim().replace(/^@/, ""); // Remove @ if present
      if (!youtubeRegex.test(cleanUrl)) {
        setError("Please enter a valid YouTube URL");
        setLanguage(null);
        return;
      }

      setIsCheckingLanguages(true);
      setError(null);

      try {
        const response = await fetch("/api/available-languages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: cleanUrl }), // Send cleaned URL
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to check languages");
        }

        if (data.defaultLanguage) {
          setLanguage(data.defaultLanguage);
        } else {
          setLanguage(null);
        }
      } catch (error) {
        console.error("Error checking languages:", error);
        setLanguage(null);
        setError(
          error instanceof Error
            ? error.message
            : "Could not get video language. Please check if the URL is correct."
        );
      } finally {
        setIsCheckingLanguages(false);
      }
    };

    if (url) {
      const timeoutId = setTimeout(checkAvailableLanguages, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setLanguage(null);
      setError(null);
    }
  }, [url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (language) {
      onSubmit(url, language);
    }
  };

  const canSubmit =
    url && language && !isLoading && !isCheckingLanguages && !error;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">
          New Transcription
        </CardTitle>
        <div className="flex items-center gap-2">
          {hasTranscript && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8"
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className={isCollapsed ? "hidden" : "space-y-6"}>
        <div className="space-y-2">
          <label htmlFor="url" className="text-sm font-medium">
            YouTube URL
          </label>
          <div className="relative">
            <Input
              id="url"
              type="url"
              placeholder="Paste YouTube URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              className={`w-full ${error ? "border-red-500" : ""} pr-8`}
            />
            {url && (
              <button
                type="button"
                onClick={() => setUrl("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {error && <div className="text-sm text-red-500">{error}</div>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {url && !isCheckingLanguages && language && !error && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <div className="text-sm text-muted-foreground">
                {LANGUAGE_NAMES[language]} (Default)
              </div>
            </div>
          )}
          {isCheckingLanguages && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking available languages...
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching...
                </>
              ) : (
                "Get Transcript"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
