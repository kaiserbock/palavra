import mongoose from "mongoose";
import { WordCategory } from "@/contexts/SavedTermsContext";

export interface ITerm {
  text: string;
  language: string;
  translation?: string;
  category?: WordCategory;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const termSchema = new mongoose.Schema<ITerm>(
  {
    text: { type: String, required: true },
    language: { type: String, required: true },
    translation: { type: String },
    category: {
      type: String,
      enum: ["verb", "adjective", "noun", "sentence", "other"],
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound unique index on text, language, and userId
termSchema.index({ text: 1, language: 1, userId: 1 }, { unique: true });

export default mongoose.models.Term ||
  mongoose.model<ITerm>("Term", termSchema);
