import mongoose from "mongoose";
import { hash } from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    nativeLanguage: {
      type: String,
      required: true,
    },
    learningLanguage: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await hash(this.password, 12);
  }
  next();
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);
