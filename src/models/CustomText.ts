import mongoose from "mongoose";

export interface ICustomText {
  _id: string;
  title: string;
  content: string;
  language: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const customTextSchema = new mongoose.Schema<ICustomText>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    language: { type: String, required: true },
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
customTextSchema.index({ userId: 1 });

export default mongoose.models.CustomText ||
  mongoose.model<ICustomText>("CustomText", customTextSchema);
