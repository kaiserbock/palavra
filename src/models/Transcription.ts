import mongoose from "mongoose";

export interface ITranscription {
  videoId: string;
  url: string;
  name: string;
  title?: string;
  language: string;
  transcript: string;
  enhancedTranscript?: string;
  terms: {
    text: string;
    translation?: string;
    position?: {
      start: number;
      end: number;
    };
  }[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

const transcriptionSchema = new mongoose.Schema<ITranscription>(
  {
    videoId: { type: String, required: true },
    url: { type: String, required: true },
    name: { type: String, required: true },
    title: { type: String },
    language: { type: String, required: true },
    transcript: { type: String, required: true },
    enhancedTranscript: { type: String },
    terms: [
      {
        text: { type: String, required: true },
        translation: String,
        position: {
          start: Number,
          end: Number,
        },
      },
    ],
    userId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Drop existing indexes and create new compound index
transcriptionSchema.index({ videoId: 1, userId: 1 }, { unique: true });

// Ensure the model is not already defined
const Transcription =
  mongoose.models.Transcription ||
  mongoose.model<ITranscription>("Transcription", transcriptionSchema);

// Drop the old index if it exists
Transcription.collection.dropIndex("videoId_1").catch(() => {
  // Ignore error if index doesn't exist
});

export default Transcription;
