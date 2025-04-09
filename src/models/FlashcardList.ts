import mongoose from "mongoose";

export interface IFlashcardList {
  name: string;
  termIds: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const flashcardListSchema = new mongoose.Schema<IFlashcardList>(
  {
    name: { type: String, required: true },
    termIds: [{ type: String }],
    userId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create an index on userId for faster queries
flashcardListSchema.index({ userId: 1 });

export default mongoose.models.FlashcardList ||
  mongoose.model<IFlashcardList>("FlashcardList", flashcardListSchema);
