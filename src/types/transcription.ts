export interface Transcription {
  _id: string;
  videoId: string;
  url: string;
  name: string;
  language: string;
  transcript: string;
  enhancedTranscript?: string;
  createdAt: string;
  terms: {
    text: string;
    translation?: string;
    position?: {
      start: number;
      end: number;
    };
  }[];
}
