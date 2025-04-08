import { useState } from "react";
import { toast } from "sonner";

export function extractVideoId(url: string) {
  const regex =
    /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export function useVideo() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");

  const setVideo = (url: string) => {
    const newVideoId = extractVideoId(url);
    if (!newVideoId) {
      toast.error("Invalid YouTube URL");
      return false;
    }

    setVideoId(newVideoId);
    setVideoUrl(url);
    return true;
  };

  const resetVideo = () => {
    setVideoId(null);
    setVideoUrl("");
  };

  return {
    videoId,
    videoUrl,
    setVideo,
    resetVideo,
  };
}
