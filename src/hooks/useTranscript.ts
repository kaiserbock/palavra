import { useState } from "react";
import { toast } from "sonner";

interface UseTranscriptProps {
  onTranscriptLoad?: (transcript: string) => void;
}

interface TranscriptResponse {
  transcript: string;
  title?: string;
  availableLanguages?: string[];
  error?: string;
}

export function useTranscript({ onTranscriptLoad }: UseTranscriptProps = {}) {
  const [transcript, setTranscript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [isEnhanced, setIsEnhanced] = useState(false);

  const fetchTranscript = async (url: string, language: string) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/transcript", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, language }),
      });

      const data: TranscriptResponse = await response.json();

      if (!response.ok) {
        if (data.availableLanguages) {
          toast.error(
            `Language not available. Available languages: ${data.availableLanguages.join(
              ", "
            )}`
          );
          return;
        }
        throw new Error(data.error || "Failed to get transcript");
      }

      setTranscript(data.transcript);
      setCurrentLanguage(language);
      setIsEnhanced(false);
      onTranscriptLoad?.(data.transcript);
      toast.success("Transcript retrieved successfully!");
      return data;
    } catch {
      toast.error("Failed to get transcript");
    } finally {
      setIsLoading(false);
    }
  };

  const enhanceTranscript = async () => {
    if (!transcript || isEnhanced) return;

    setIsEnhancing(true);
    try {
      const response = await fetch("/api/enhance-transcript", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript,
          language: currentLanguage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to enhance transcript");
      }

      setTranscript(data.enhancedTranscript);
      setIsEnhanced(true);
      toast.success("Transcript enhanced successfully!");
    } catch {
      toast.error("Failed to enhance transcript");
    } finally {
      setIsEnhancing(false);
    }
  };

  const resetTranscript = () => {
    setTranscript("");
    setIsEnhanced(false);
    setIsEnhancing(false);
  };

  return {
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
  };
}
